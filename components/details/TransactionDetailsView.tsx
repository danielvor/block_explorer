
import React, { useState, useCallback } from 'react';
import { Transaction, GroundingSource } from '../../types';
import Card from '../common/Card';
import DetailItem from '../common/DetailItem';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatTimestamp, generateGeminiText } from '../../services/geminiService';
import { ClipboardDocumentCheckIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface TransactionDetailsViewProps {
  transaction: Transaction;
  onNavigateToBlock: (blockId: number) => void;
  onNavigateToAddress: (address: string) => void;
}

const ClipboardDocumentCheckIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
);
const CpuChipIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
   <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M12 4.5V3m0 18v-1.5m3.75-15H21m-18 0h1.5M12 21v-1.5m0-15V3m0 1.5v15m0 0v1.5m-3.75-18v1.5M21 15.75h-1.5m-15 0H3" />
 </svg>
 );


const TransactionDetailsView: React.FC<TransactionDetailsViewProps> = ({ transaction, onNavigateToBlock, onNavigateToAddress }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | undefined>(undefined);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const fetchTransactionSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummary(null);
    setSources(undefined);
    const prompt = `Provide a concise explanation of an Ethereum-like transaction with the following details:
    - Hash: ${transaction.hash}
    - From: ${transaction.from}
    - To: ${transaction.to}
    - Value: ${transaction.value}
    - Gas Used: ${transaction.gasUsed.toLocaleString()}
    - Gas Price: ${transaction.gasPrice}
    - Timestamp: ${formatTimestamp(transaction.timestamp)}
    - Status: ${transaction.status}
    What could this transaction represent (e.g., token transfer, contract interaction, simple ETH transfer)? Explain its potential significance in simple terms. Use Google Search for context if needed, for example, if the 'To' address is a known contract.`;
    
    const {text: resultText, sources: resultSources} = await generateGeminiText(prompt, true);
    setSummary(resultText);
    setSources(resultSources);
    setIsLoadingSummary(false);
  }, [transaction]);

  return (
    <div className="space-y-6">
      <Card title="Transaction Details" icon={typeof ClipboardDocumentCheckIcon !== 'undefined' ? <ClipboardDocumentCheckIcon className="w-6 h-6" /> : <ClipboardDocumentCheckIconPlaceholder className="w-6 h-6"/>}>
        <dl className="divide-y divide-slate-700">
          <DetailItem label="Transaction Hash" value={transaction.hash} isHash />
          <DetailItem label="Status" value={
            <span className={`${transaction.status === 'Success' ? 'text-green-400' : 'text-red-400'} font-semibold`}>
              {transaction.status}
            </span>
          } />
          {transaction.blockId !== null && (
            <DetailItem 
              label="Block" 
              value={
                <button 
                  onClick={() => onNavigateToBlock(transaction.blockId!)} 
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  {transaction.blockId}
                </button>
              } 
            />
          )}
          <DetailItem label="Timestamp" value={formatTimestamp(transaction.timestamp) + ` (${transaction.timestamp})`} />
          <DetailItem label="From" value={transaction.from} isHash onNavigate={onNavigateToAddress} />
          <DetailItem label="To" value={transaction.to} isHash onNavigate={onNavigateToAddress} />
          <DetailItem label="Value" value={transaction.value} />
          <DetailItem label="Gas Used" value={transaction.gasUsed.toLocaleString()} />
          <DetailItem label="Gas Price" value={transaction.gasPrice} />
        </dl>
      </Card>

      <Card title="AI Powered Transaction Explanation" icon={typeof CpuChipIcon !== 'undefined' ? <CpuChipIcon className="w-6 h-6" /> : <CpuChipIconPlaceholder className="w-6 h-6"/>}>
         {!process.env.API_KEY && <p className="text-amber-500 text-sm">Gemini API Key not configured. AI explanations are unavailable.</p>}
         {process.env.API_KEY && (
            <>
              <button
                onClick={fetchTransactionSummary}
                disabled={isLoadingSummary}
                className="mb-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isLoadingSummary ? 'Generating Explanation...' : 'Explain Transaction with AI'}
              </button>
              {isLoadingSummary && <LoadingSpinner text="Gemini is thinking..." />}
              {summary && <p className="text-slate-300 whitespace-pre-wrap">{summary}</p>}
              {sources && sources.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-1">Sources:</h4>
                <ul className="list-disc list-inside text-xs">
                  {sources.map((source, idx) => (
                    <li key={idx} className="text-slate-400">
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                        {source.web.title || source.web.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </>
         )}
      </Card>
    </div>
  );
};

export default TransactionDetailsView;
