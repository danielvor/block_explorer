
export interface Block {
  id: number;
  timestamp: number;
  miner: string;
  hash: string;
  parentHash: string;
  transactionHashes: string[];
  gasUsed: number;
  gasLimit: number;
  size: number;
}

export interface Transaction {
  hash: string;
  blockId: number | null; // Can be null if pending
  from: string;
  to: string;
  value: string; // e.g., "1.23 ETH"
  gasPrice: string; // e.g., "20 Gwei"
  gasUsed: number;
  timestamp: number;
  status: 'Success' | 'Failed';
}

export interface AddressDetails {
  address: string;
  balance: string; // e.g., "100.5 ETH"
  transactionCount: number;
  transactions: Transaction[]; // Last N transactions involving this address
}

export enum ViewType {
  HOME = 'HOME',
  BLOCK = 'BLOCK',
  TRANSACTION = 'TRANSACTION',
  ADDRESS = 'ADDRESS',
  NOT_FOUND = 'NOT_FOUND',
}

export interface SearchResult {
  type: ViewType;
  data: Block | Transaction | AddressDetails | null;
  query: string;
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}
