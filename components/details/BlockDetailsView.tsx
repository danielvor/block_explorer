
import React, { useState, useCallback } from 'react';
import { Block, GroundingSource } from '../../types';
import Card from '../common/Card';
import DetailItem from '../common/DetailItem';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatTimestamp, generateGeminiText } from '../../services/geminiService';
import { CubeIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface BlockDetailsViewProps {
  block: Block;
  onNavigateToTransaction: (txHash: string) => void;
  onNavigateToAddress: (address: string) => void;
}

const CubeIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);
const CpuChipIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M12 4.5V3m0 18v-1.5m3.75-15H21m-18 0h1.5M12 21v-1.5m0-15V3m0 1.5v15m0 0v1.5m-3.75-18v1.5M21 15.75h-1.5m-15 0H3" />
</svg>
);


const BlockDetailsView: React.FC<BlockDetailsViewProps> = ({ block, onNavigateToTransaction, onNavigateToAddress }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | undefined>(undefined);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const fetchBlockSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummary(null);
    setSources(undefined);
    const prompt = `Provide a concise summary and potential significance of Ethereum block #${block.id}.
    Key details:
    - Timestamp: ${formatTimestamp(block.timestamp)}
    - Miner: ${block.miner}
    - Transactions: ${block.transactionHashes.length}
    - Gas Used: ${block.gasUsed.toLocaleString()}
    - Gas Limit: ${block.gasLimit.toLocaleString()}
    - Size: ${block.size.toLocaleString()} bytes
    Explain in simple terms what this block represents and if there are any notable characteristics based on these generic stats. Assume this is a standard Proof-of-Stake block on a major EVM compatible chain. Use Google Search for context if relevant about block significance during its timestamp.`;
    
    const {text: resultText, sources: resultSources} = await generateGeminiText(prompt, true);
    setSummary(resultText);
    setSources(resultSources);
    setIsLoadingSummary(false);
  }, [block]);

  return (
    <div className="space-y-6">
      <Card title={`Block #${block.id}`} icon={typeof CubeIcon !== 'undefined' ? <CubeIcon className="w-6 h-6" /> : <CubeIconPlaceholder className="w-6 h-6"/>}>
        <dl className="divide-y divide-slate-700">
          <DetailItem label="Block Hash" value={block.hash} isHash />
          <DetailItem label="Timestamp" value={formatTimestamp(block.timestamp) + ` (${block.timestamp})`} />
          <DetailItem label="Transactions" value={`${block.transactionHashes.length} transactions in this block`} />
          <DetailItem label="Miner" value={block.miner} isHash onNavigate={onNavigateToAddress} />
          <DetailItem label="Parent Hash" value={block.parentHash} isHash />
          <DetailItem label="Gas Used" value={block.gasUsed.toLocaleString()} />
          <DetailItem label="Gas Limit" value={block.gasLimit.toLocaleString()} />
          <DetailItem label="Size" value={`${block.size.toLocaleString()} bytes`} />
        </dl>
      </Card>

      <Card title="AI Powered Block Summary" icon={typeof CpuChipIcon !== 'undefined' ? <CpuChipIcon className="w-6 h-6" /> : <CpuChipIconPlaceholder className="w-6 h-6"/>}>
        {!process.env.API_KEY && <p className="text-amber-500 text-sm">Gemini API Key not configured. AI summaries are unavailable.</p>}
        {process.env.API_KEY && (
          <>
            <button
              onClick={fetchBlockSummary}
              disabled={isLoadingSummary}
              className="mb-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isLoadingSummary ? 'Generating Summary...' : 'Generate Block Summary with AI'}
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

      {block.transactionHashes.length > 0 && (
        <Card title="Transactions">
          <ul className="divide-y divide-slate-700">
            {block.transactionHashes.map(txHash => (
              <li key={txHash} className="py-3">
                <button
                  onClick={() => onNavigateToTransaction(txHash)}
                  className="text-sky-400 hover:text-sky-300 hover:underline break-all text-left"
                  title={txHash}
                >
                  {txHash}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default BlockDetailsView;
