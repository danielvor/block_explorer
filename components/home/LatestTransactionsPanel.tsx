
import React from 'react';
import { Transaction } from '../../types';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatTimestamp } from '../../services/geminiService';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface LatestTransactionsPanelProps {
  transactions: Transaction[];
  isLoading: boolean;
  onTransactionSelect: (txHash: string) => void;
  onAddressSelect: (address: string) => void;
}

const ClipboardDocumentListIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.15 47.905 47.905 0 0 0 .716 .054M2.25 18.75a4.5 4.5 0 0 0 4.5 4.5h10.5a4.5 4.5 0 0 0 4.5-4.5V6.75a4.5 4.5 0 0 0-4.5-4.5H6.75a4.5 4.5 0 0 0-4.5 4.5v12Z" />
  </svg>
);


const LatestTransactionsPanel: React.FC<LatestTransactionsPanelProps> = ({ transactions, isLoading, onTransactionSelect, onAddressSelect }) => {
  if (isLoading) {
    return <Card title="Latest Transactions"><LoadingSpinner /></Card>;
  }

  return (
    <Card title="Latest Transactions" icon={typeof ClipboardDocumentListIcon !== 'undefined' ? <ClipboardDocumentListIcon className="w-6 h-6" /> : <ClipboardDocumentListIconPlaceholder className="w-6 h-6"/>}>
      <div className="flow-root">
        <ul role="list" className="-mb-4">
          {transactions.map((tx, index) => (
            <li key={tx.hash} className={`py-3 ${index < transactions.length -1 ? 'border-b border-slate-700' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                <div className="md:col-span-1">
                  <button 
                    onClick={() => onTransactionSelect(tx.hash)}
                    className="text-sky-400 hover:text-sky-300 hover:underline font-medium text-left break-all"
                    title={tx.hash}
                  >
                    {`${tx.hash.substring(0,10)}...`}
                  </button>
                  <p className="text-xs text-slate-400">{formatTimestamp(tx.timestamp)}</p>
                </div>
                <div className="md:col-span-2 text-sm">
                  <p className="truncate">
                    <span className="text-slate-400">From: </span>
                     <button onClick={() => onAddressSelect(tx.from)} className="text-sky-400 hover:text-sky-300" title={tx.from}>
                        {`${tx.from.substring(0,8)}...${tx.from.substring(tx.from.length - 6)}`}
                    </button>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">To: </span>
                    <button onClick={() => onAddressSelect(tx.to)} className="text-sky-400 hover:text-sky-300" title={tx.to}>
                        {`${tx.to.substring(0,8)}...${tx.to.substring(tx.to.length - 6)}`}
                    </button>
                  </p>
                  <p className="text-slate-300 font-medium">{tx.value}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default LatestTransactionsPanel;
