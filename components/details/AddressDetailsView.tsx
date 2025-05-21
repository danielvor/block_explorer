
import React, { useState, useCallback } from 'react';
import { AddressDetails as AddressDetailsType, Transaction, GroundingSource } from '../../types';
import Card from '../common/Card';
import DetailItem from '../common/DetailItem';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatTimestamp, generateGeminiText } from '../../services/geminiService';
import { UserCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface AddressDetailsViewProps {
  addressDetails: AddressDetailsType;
  onNavigateToTransaction: (txHash: string) => void;
  onNavigateToAddress: (address: string) => void; // For internal links if needed
}

const UserCircleIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
);
const CpuChipIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
   <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M12 4.5V3m0 18v-1.5m3.75-15H21m-18 0h1.5M12 21v-1.5m0-15V3m0 1.5v15m0 0v1.5m-3.75-18v1.5M21 15.75h-1.5m-15 0H3" />
 </svg>
 );


const AddressDetailsView: React.FC<AddressDetailsViewProps> = ({ addressDetails, onNavigateToTransaction, onNavigateToAddress }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | undefined>(undefined);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const fetchAddressSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummary(null);
    setSources(undefined);
    const prompt = `Provide a brief overview of an Ethereum-like address: ${addressDetails.address}.
    Key details:
    - Balance: ${addressDetails.balance}
    - Transaction Count: ${addressDetails.transactionCount}
    What type of address could this be (e.g., EOA, contract)? What does its activity (balance, transaction count) suggest? Use Google Search for context, e.g., to check if it's a known contract address or associated with a known entity.`;
    
    const {text: resultText, sources: resultSources} = await generateGeminiText(prompt, true);
    setSummary(resultText);
    setSources(resultSources);
    setIsLoadingSummary(false);
  }, [addressDetails]);

  return (
    <div className="space-y-6">
      <Card title="Address Details" icon={typeof UserCircleIcon !== 'undefined' ? <UserCircleIcon className="w-6 h-6" /> : <UserCircleIconPlaceholder className="w-6 h-6"/>}>
        <dl className="divide-y divide-slate-700">
          <DetailItem label="Address" value={addressDetails.address} isHash />
          <DetailItem label="Balance" value={addressDetails.balance} />
          <DetailItem label="Transaction Count" value={addressDetails.transactionCount.toLocaleString()} />
        </dl>
      </Card>

      <Card title="AI Powered Address Overview" icon={typeof CpuChipIcon !== 'undefined' ? <CpuChipIcon className="w-6 h-6" /> : <CpuChipIconPlaceholder className="w-6 h-6"/>}>
        {!process.env.API_KEY && <p className="text-amber-500 text-sm">Gemini API Key not configured. AI overviews are unavailable.</p>}
        {process.env.API_KEY && (
          <>
            <button
              onClick={fetchAddressSummary}
              disabled={isLoadingSummary}
              className="mb-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isLoadingSummary ? 'Generating Overview...' : 'Get AI Address Overview'}
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

      {addressDetails.transactions.length > 0 && (
        <Card title={`Last ${addressDetails.transactions.length} Transactions`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Hash</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Block</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">From</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">To</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {addressDetails.transactions.map((tx: Transaction) => (
                  <tr key={tx.hash} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => onNavigateToTransaction(tx.hash)} className="text-sky-400 hover:text-sky-300 text-sm" title={tx.hash}>
                        {`${tx.hash.substring(0,10)}...`}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300 hidden md:table-cell">{tx.blockId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">{formatTimestamp(tx.timestamp)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => onNavigateToAddress(tx.from)} className="text-sky-400 hover:text-sky-300 text-sm" title={tx.from}>
                        {`${tx.from.substring(0,8)}...${tx.from.substring(tx.from.length-6)}`}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <button onClick={() => onNavigateToAddress(tx.to)} className="text-sky-400 hover:text-sky-300 text-sm" title={tx.to}>
                        {`${tx.to.substring(0,8)}...${tx.to.substring(tx.to.length-6)}`}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-200 font-medium">{tx.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AddressDetailsView;
