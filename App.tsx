
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import LatestBlocksPanel from './components/home/LatestBlocksPanel';
import LatestTransactionsPanel from './components/home/LatestTransactionsPanel';
import BlockDetailsView from './components/details/BlockDetailsView';
import TransactionDetailsView from './components/details/TransactionDetailsView';
import AddressDetailsView from './components/details/AddressDetailsView';
import NotFoundContent from './components/NotFoundContent';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Block, Transaction, AddressDetails, ViewType, SearchResult } from './types';
import { LATEST_ITEMS_COUNT } from './constants';
import { 
  getLatestBlocks, 
  getLatestTransactions, 
  searchBlockchain,
  getBlockById,
  getTransactionByHash,
  getAddressDetails
} from './services/blockchainService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [searchResultData, setSearchResultData] = useState<Block | Transaction | AddressDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
  
  const [isLoading, setIsLoading] = useState(false); // General loading for page transitions or main data
  const [isSearchLoading, setIsSearchLoading] = useState(false); // Specific for search bar
  const [isHomeDataLoading, setIsHomeDataLoading] = useState(false);

  const fetchHomeData = useCallback(async () => {
    setIsHomeDataLoading(true);
    try {
      const [blocks, transactions] = await Promise.all([
        getLatestBlocks(LATEST_ITEMS_COUNT),
        getLatestTransactions(LATEST_ITEMS_COUNT)
      ]);
      setLatestBlocks(blocks);
      setLatestTransactions(transactions);
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setIsHomeDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch once on mount

  const handleSearch = async (query: string) => {
    setIsSearchLoading(true);
    setIsLoading(true); // General loading for view change
    setSearchQuery(query);
    const result: SearchResult = await searchBlockchain(query);
    setSearchResultData(result.data);
    setCurrentView(result.type);
    setIsSearchLoading(false);
    setIsLoading(false);
    window.scrollTo(0, 0); // Scroll to top on new view
  };
  
  const navigateToHome = () => {
    setCurrentView(ViewType.HOME);
    setSearchResultData(null);
    setSearchQuery('');
    fetchHomeData(); // Refresh home data when navigating home
    window.scrollTo(0, 0);
  };

  const navigateToBlock = async (blockId: number) => {
    setIsLoading(true);
    const block = await getBlockById(blockId);
    if (block) {
      setSearchResultData(block);
      setCurrentView(ViewType.BLOCK);
      setSearchQuery(String(blockId));
    } else {
      setCurrentView(ViewType.NOT_FOUND);
      setSearchQuery(String(blockId));
    }
    setIsLoading(false);
    window.scrollTo(0, 0);
  };

  const navigateToTransaction = async (txHash: string) => {
    setIsLoading(true);
    const tx = await getTransactionByHash(txHash);
    if (tx) {
      setSearchResultData(tx);
      setCurrentView(ViewType.TRANSACTION);
      setSearchQuery(txHash);
    } else {
      setCurrentView(ViewType.NOT_FOUND);
      setSearchQuery(txHash);
    }
    setIsLoading(false);
    window.scrollTo(0, 0);
  };

  const navigateToAddress = async (address: string) => {
    setIsLoading(true);
    const addrDetails = await getAddressDetails(address);
    if (addrDetails) {
      setSearchResultData(addrDetails);
      setCurrentView(ViewType.ADDRESS);
      setSearchQuery(address);
    } else {
      setCurrentView(ViewType.NOT_FOUND);
      setSearchQuery(address);
    }
    setIsLoading(false);
    window.scrollTo(0, 0);
  };


  const renderContent = () => {
    if (isLoading) {
      return <div className="mt-8"><LoadingSpinner text="Loading details..." size="lg" /></div>;
    }

    switch (currentView) {
      case ViewType.HOME:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <LatestBlocksPanel 
              blocks={latestBlocks} 
              isLoading={isHomeDataLoading} 
              onBlockSelect={navigateToBlock}
              onAddressSelect={navigateToAddress} 
            />
            <LatestTransactionsPanel 
              transactions={latestTransactions} 
              isLoading={isHomeDataLoading} 
              onTransactionSelect={navigateToTransaction}
              onAddressSelect={navigateToAddress}
            />
          </div>
        );
      case ViewType.BLOCK:
        return searchResultData ? <BlockDetailsView block={searchResultData as Block} onNavigateToTransaction={navigateToTransaction} onNavigateToAddress={navigateToAddress} /> : <NotFoundContent query={searchQuery} />;
      case ViewType.TRANSACTION:
        return searchResultData ? <TransactionDetailsView transaction={searchResultData as Transaction} onNavigateToBlock={navigateToBlock} onNavigateToAddress={navigateToAddress} /> : <NotFoundContent query={searchQuery} />;
      case ViewType.ADDRESS:
        return searchResultData ? <AddressDetailsView addressDetails={searchResultData as AddressDetails} onNavigateToTransaction={navigateToTransaction} onNavigateToAddress={navigateToAddress}/> : <NotFoundContent query={searchQuery} />;
      case ViewType.NOT_FOUND:
        return <NotFoundContent query={searchQuery} />;
      default:
        return <NotFoundContent />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} onLogoClick={navigateToHome} isSearchLoading={isSearchLoading} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderContent()}
      </main>
      <footer className="bg-slate-800 text-center py-6 mt-auto">
        <p className="text-sm text-slate-400">
          Block Explorer - A Mock Data Demo. {process.env.API_KEY ? 'Gemini AI features enabled.' : <span className="text-amber-500">Gemini AI features disabled (API_KEY not set).</span>}
        </p>
      </footer>
    </div>
  );
};

export default App;
