// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * RegCFToken — Class B Non-Voting Membership Units (Equity-style ERC20)
 *
 * • Each token = 1 Class B Unit (fractional if decimals = 2).
 * • No on-chain pricing/sale; mint only after off-chain subscription/escrow (Kore/BD/TA).
 * • KYC allowlist: only approved addresses can receive/mint.
 * • Reg CF 12-month transfer restriction from issuance with allowed exemptions:
 *      - Transfer to issuer/admin wallet (buyback/redemption).
 *      - Transfer to an accredited investor.
 *      - Transfer to a trust controlled by the investor.
 *      - Estate/divorce cases via pre-approved FROM→TO pair.
 * • Optional global unlock after 12 months from offeringStart (still KYC-gated).
 * • Cap-table helpers to enumerate holders.
 *
 * Implementation guidance only; confirm with counsel/portal/TA.
 */
contract RegCFToken is ERC20, AccessControlEnumerable, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // ---------- Roles ----------
    bytes32 public constant ADMIN_ROLE         = keccak256("ADMIN_ROLE");          // issuer/admin
    bytes32 public constant KYC_MANAGER_ROLE   = keccak256("KYC_MANAGER_ROLE");    // Kore/portal sync
    bytes32 public constant EXEMPT_SETTER_ROLE = keccak256("EXEMPT_SETTER_ROLE");  // set exemptions

    // ---------- Offering params ----------
    uint256 public immutable maxSupply;        // total units available (in smallest units)
    uint256 public immutable offeringStart;    // timestamp when offering starts
    uint256 public immutable globalUnlockTime; // offeringStart + 365 days
    uint8   private immutable _decimals;       // 0 (whole units) or 2 (hundredths)

    // ---------- Compliance / KYC ----------
    mapping(address => bool) public isWhitelisted;  // destination must be KYC-approved
    mapping(address => bool) public isAccredited;   // accredited investors
    mapping(address => bool) public isTrust;        // trusts controlled by investors

    // Estate/special-case FROM→TO pre-approval
    mapping(bytes32 => bool) public isPairExempt;   // keccak256(abi.encode(from,to)) => true

    // Per-holder lockup end (set/extended on mint and when receiving during restricted period)
    mapping(address => uint256) public lockedUntil;

    // Optional global switch after 12 months (offering-level)
    bool public globalTransfersEnabled;

    // Track holders for cap table export
    EnumerableSet.AddressSet private _holders;

    // ---------- Events ----------
    event KYCUpdated(address indexed account, bool whitelisted);
    event AccreditedUpdated(address indexed account, bool accredited);
    event TrustUpdated(address indexed account, bool trust);
    event SpecialPairApproved(address indexed from, address indexed to, bool allowed);
    event GlobalTransfersEnabled(uint256 at);
    event AdminMint(address indexed to, uint256 amount, uint256 lockedUntil);
    event AdminBurn(address indexed from, uint256 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,          // 0 or 2
        uint256 maxSupply_,       // e.g., 1_000_000 if $1 = 1 token and $1M raise
        uint256 offeringStart_    // usually block.timestamp at deployment
    ) ERC20(name_, symbol_) {
        require(decimals_ == 0 || decimals_ == 2, "decimals must be 0 or 2");
        _decimals = decimals_;
        maxSupply = maxSupply_;
        offeringStart = offeringStart_;
        globalUnlockTime = offeringStart_ + 365 days;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(KYC_MANAGER_ROLE, msg.sender);
        _grantRole(EXEMPT_SETTER_ROLE, msg.sender);
    }

    // ---------- Metadata ----------
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    // ---------- Admin controls ----------
    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    /**
     * @notice Enable global transfers after offering-level 12 months.
     *         Still requires destination KYC allowlist.
     */
    function enableTransfers() external onlyRole(ADMIN_ROLE) {
        require(block.timestamp >= globalUnlockTime, "Too early for global unlock");
        globalTransfersEnabled = true;
        emit GlobalTransfersEnabled(block.timestamp);
    }

    /**
     * @notice Update KYC/AML allowlist (Kore integration hook).
     */
    function updateKYCStatus(address account, bool allowed)
        external
        onlyRole(KYC_MANAGER_ROLE)
    {
        isWhitelisted[account] = allowed;
        emit KYCUpdated(account, allowed);
    }

    function setAccredited(address account, bool val)
        external
        onlyRole(EXEMPT_SETTER_ROLE)
    {
        isAccredited[account] = val;
        emit AccreditedUpdated(account, val);
    }

    function setTrust(address account, bool val)
        external
        onlyRole(EXEMPT_SETTER_ROLE)
    {
        isTrust[account] = val;
        emit TrustUpdated(account, val);
    }

    /**
     * @notice Approve a specific FROM→TO pair for estate/divorce transfers during lockup.
     */
    function approveSpecialPair(address from, address to, bool allowed)
        external
        onlyRole(EXEMPT_SETTER_ROLE)
    {
        bytes32 key = keccak256(abi.encode(from, to));
        isPairExempt[key] = allowed;
        emit SpecialPairApproved(from, to, allowed);
    }

    /**
     * @notice Admin mint after off-chain subscription settlement.
     *         Sets/extends recipient lock to 12 months from now for newly issued tokens.
     */
    function mint(address to, uint256 amount)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        require(isWhitelisted[to], "Recipient not KYC-approved");
        require(totalSupply() + amount <= maxSupply, "Exceeds maxSupply");

        _mint(to, amount);

        // Set/extend lock to at least 12 months from now
        uint256 newLock = block.timestamp + 365 days;
        if (newLock > lockedUntil[to]) {
            lockedUntil[to] = newLock;
        }

        emit AdminMint(to, amount, lockedUntil[to]);
    }

    /**
     * @notice Admin burn (e.g., redemption/cancellation after investor exit).
     */
    function adminBurnFrom(address from, uint256 amount)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        _burn(from, amount);
        emit AdminBurn(from, amount);
    }

    // ---------- Transfer gating ----------
    function _isExemptDestination(address to) internal view returns (bool) {
        // Allowed exemption recipients during lockup:
        //  - any ADMIN_ROLE address (issuer buyback)
        //  - accredited investors
        //  - trusts controlled by investors
        return hasRole(ADMIN_ROLE, to) || isAccredited[to] || isTrust[to];
    }

    function _isPairApproved(address from, address to) internal view returns (bool) {
        return isPairExempt[keccak256(abi.encode(from, to))];
    }

    function _canTransfer(address from, address to) internal view returns (bool) {
        if (paused()) return false;
        if (to == address(0)) return true;                 // burns allowed
        if (!isWhitelisted[to]) return false;              // destination must be allowlisted

        // Mints handled separately; this path is for regular transfers
        if (from == address(0)) return true;

        // If global switch enabled after 12 months, skip per-address lock checks
        if (globalTransfersEnabled) return true;

        // Otherwise enforce per-holder lock, with Reg CF exemptions
        if (block.timestamp >= lockedUntil[from]) return true;

        // During lockup, allow only if destination is exempt OR pair is pre-approved
        return _isExemptDestination(to) || _isPairApproved(from, to);
    }

    // ---------- Token hooks ----------
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
    {
        super._beforeTokenTransfer(from, to, amount);

        // Mint: enforce pause + KYC on recipient
        if (from == address(0)) {
            require(!paused(), "Pausable: paused");
            require(isWhitelisted[to], "Recipient not KYC-approved");
            return;
        }

        // Regular transfer
        if (from != address(0) && to != address(0)) {
            require(_canTransfer(from, to), "Transfer restricted");
        }
        // Burn (to == address(0)) allowed; adminBurnFrom controls admin-initiated burns.
    }

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override
    {
        super._afterTokenTransfer(from, to, amount);

        // Maintain holder set for cap table export
        if (to != address(0) && balanceOf(to) > 0) {
            _holders.add(to);
        }
        if (from != address(0) && balanceOf(from) == 0) {
            _holders.remove(from);
        }

        // If a transfer occurs during lockup under an exemption (not global),
        // carry over the remaining lock to the recipient.
        if (
            from != address(0) &&
            to != address(0) &&
            !globalTransfersEnabled &&
            block.timestamp < lockedUntil[from]
        ) {
            uint256 remaining = lockedUntil[from] - block.timestamp;
            uint256 candidate = block.timestamp + remaining;
            if (candidate > lockedUntil[to]) {
                lockedUntil[to] = candidate;
            }
        }
    }

    // ---------- Cap table helpers ----------
    function holderCount() external view returns (uint256) {
        return _holders.length();
    }

    function holderAt(uint256 index) external view returns (address) {
        return _holders.at(index);
    }

    function holders(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory addrs)
    {
        uint256 len = _holders.length();

        // Compute end safely without early return
        uint256 end = offset + limit;
        if (offset >= len) {
            end = offset; // zero results
        } else if (end > len) {
            end = len;
        }

        uint256 count = (end > offset) ? (end - offset) : 0;
        addrs = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            addrs[i] = _holders.at(offset + i);
        }
    }
}

