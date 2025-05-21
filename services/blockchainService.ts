
import { Block, Transaction, AddressDetails, ViewType, SearchResult } from '../types';
import { MOCK_TRANSACTION_COUNT, MOCK_BLOCK_COUNT } from '../constants';

const generateRandomHash = (length = 64): string => {
  return '0x' + Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const generateRandomAddress = (): string => {
  return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

let mockBlocks: Block[] = [];
let mockTransactions: Transaction[] = [];

const initializeMockData = () => {
  if (mockBlocks.length > 0 && mockTransactions.length > 0) return;

  const now = Math.floor(Date.now() / 1000);

  // Generate transactions first
  for (let i = 0; i < MOCK_TRANSACTION_COUNT; i++) {
    mockTransactions.push({
      hash: generateRandomHash(),
      blockId: null, // Will be assigned when blocks are created
      from: generateRandomAddress(),
      to: generateRandomAddress(),
      value: `${(Math.random() * 10).toFixed(2)} ETH`,
      gasPrice: `${Math.floor(Math.random() * 50) + 5} Gwei`,
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      timestamp: now - Math.floor(Math.random() * 86400 * 30), // Within last 30 days
      status: Math.random() > 0.1 ? 'Success' : 'Failed',
    });
  }
  
  mockTransactions.sort((a, b) => b.timestamp - a.timestamp);


  // Generate blocks and assign transactions
  let transactionIndex = 0;
  for (let i = 0; i < MOCK_BLOCK_COUNT; i++) {
    const blockTimestamp = now - i * 15 - Math.floor(Math.random() * 5); // ~15s block time
    const numTransactionsInBlock = Math.floor(Math.random() * (MOCK_TRANSACTION_COUNT / MOCK_BLOCK_COUNT)) + 1;
    const blockTransactionHashes: string[] = [];

    for (let j = 0; j < numTransactionsInBlock && transactionIndex < mockTransactions.length; j++) {
      mockTransactions[transactionIndex].blockId = MOCK_BLOCK_COUNT - 1 - i;
      mockTransactions[transactionIndex].timestamp = blockTimestamp - Math.floor(Math.random() * 10); // tx timestamp slightly before block
      blockTransactionHashes.push(mockTransactions[transactionIndex].hash);
      transactionIndex++;
    }
    
    mockBlocks.push({
      id: MOCK_BLOCK_COUNT - 1 - i, // Descending IDs for latest first
      timestamp: blockTimestamp,
      miner: generateRandomAddress(),
      hash: generateRandomHash(),
      parentHash: i > 0 ? mockBlocks[i-1].hash : generateRandomHash(64), // parent of current i is previous block (i-1)
      transactionHashes: blockTransactionHashes,
      gasUsed: Math.floor(Math.random() * 10000000) + 5000000,
      gasLimit: 15000000,
      size: Math.floor(Math.random() * 50000) + 10000,
    });
  }
  // Reverse blocks to have latest first by ID as well
  mockBlocks.reverse(); // So block 0 is oldest, block N-1 is newest
  mockTransactions.forEach(tx => {
    if(tx.blockId !== null) {
      const block = mockBlocks.find(b => b.id === tx.blockId);
      if(block) tx.timestamp = block.timestamp - Math.floor(Math.random() * 5);
    }
  });
  mockTransactions.sort((a,b) => b.timestamp - a.timestamp);
};


initializeMockData(); // Initialize data on load

export const getLatestBlocks = async (count: number): Promise<Block[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return [...mockBlocks].sort((a,b) => b.id - a.id).slice(0, count);
};

export const getLatestTransactions = async (count: number): Promise<Transaction[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockTransactions].sort((a,b) => b.timestamp - a.timestamp).slice(0, count);
};

export const getBlockById = async (id: number): Promise<Block | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const block = mockBlocks.find(b => b.id === id);
  return block || null;
};

export const getTransactionByHash = async (hash: string): Promise<Transaction | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const transaction = mockTransactions.find(tx => tx.hash === hash);
  return transaction || null;
};

export const getAddressDetails = async (address: string): Promise<AddressDetails | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const lowerAddress = address.toLowerCase();
  const involvedTransactions = mockTransactions.filter(
    tx => tx.from.toLowerCase() === lowerAddress || tx.to.toLowerCase() === lowerAddress
  ).sort((a,b) => b.timestamp - a.timestamp);

  if (involvedTransactions.length === 0 && !mockBlocks.find(b => b.miner.toLowerCase() === lowerAddress)) { // Check if miner
     // Simple check if it's a known address at all (could be a contract with no direct txs listed here, or just unknown)
    const isPotentiallyKnown = mockTransactions.some(tx => tx.from.toLowerCase() === lowerAddress || tx.to.toLowerCase() === lowerAddress) ||
                               mockBlocks.some(b => b.miner.toLowerCase() === lowerAddress);
    if(!isPotentiallyKnown) return null; // Truly unknown address
  }


  // Simplified balance calculation
  let balance = 0;
  involvedTransactions.forEach(tx => {
    const value = parseFloat(tx.value.split(' ')[0]);
    if (tx.to.toLowerCase() === lowerAddress) balance += value;
    if (tx.from.toLowerCase() === lowerAddress) balance -= value; // Simplified, doesn't account for gas
  });

  return {
    address: address,
    balance: `${balance.toFixed(4)} ETH`, // Rough balance
    transactionCount: involvedTransactions.length,
    transactions: involvedTransactions.slice(0, 20), // Return last 20 transactions
  };
};

export const searchBlockchain = async (query: string): Promise<SearchResult> => {
  initializeMockData(); // Ensure data is there
  await new Promise(resolve => setTimeout(resolve, 600));
  const trimmedQuery = query.trim();

  // Check if it's a block number
  if (/^\d+$/.test(trimmedQuery)) {
    const blockId = parseInt(trimmedQuery, 10);
    const block = await getBlockById(blockId);
    if (block) {
      return { type: ViewType.BLOCK, data: block, query: trimmedQuery };
    }
  }

  // Check if it's an address (0x + 40 hex chars)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmedQuery)) {
    const addressDetails = await getAddressDetails(trimmedQuery);
    if (addressDetails) {
      return { type: ViewType.ADDRESS, data: addressDetails, query: trimmedQuery };
    }
  }

  // Check if it's a transaction hash (0x + 64 hex chars)
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmedQuery)) {
    // Could also be a block hash. For this mock, prioritize transaction.
    const transaction = await getTransactionByHash(trimmedQuery);
    if (transaction) {
      return { type: ViewType.TRANSACTION, data: transaction, query: trimmedQuery };
    }
    // Check if it's a block hash
    const blockByHash = mockBlocks.find(b => b.hash === trimmedQuery);
    if (blockByHash) {
        return { type: ViewType.BLOCK, data: blockByHash, query: trimmedQuery };
    }
  }
  
  return { type: ViewType.NOT_FOUND, data: null, query: trimmedQuery };
};
