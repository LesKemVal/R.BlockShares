# Platform Architecture — High Level

```mermaid
flowchart LR
  User[Investor / Issuer] -->|Web| UI[Kore Front-End (white-label)]
  UI -->|Pre-clear UI / Templates| BD[Broker-Dealer Supervision (WSP)]
  UI -->|KYC/AML, Cap Table| KoreOps[Kore Compliance / Cap Table]
  UI -->|RPC via API| SM[SettleMint Orchestration / Node]
  SM -->|Deploy / Tx| SC[BusinessFranchiseToken (Sepolia)]
  SC -->|Events / State| ES[Etherscan (Verified Source)]
  User -->|Funds| NC[North Capital Escrow]
  NC -->|Statuses / Recons| BD
  BD -->|Archiving / Records| Records[Books & Records (17a-4)]

