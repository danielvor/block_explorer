
import React from 'react';
import { Block } from '../../types';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatTimestamp } from '../../services/geminiService'; // Re-use formatting
import { CubeIcon } from '@heroicons/react/24/outline';

interface LatestBlocksPanelProps {
  blocks: Block[];
  isLoading: boolean;
  onBlockSelect: (blockId: number) => void;
  onAddressSelect: (address: string) => void;
}

const CubeIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const LatestBlocksPanel: React.FC<LatestBlocksPanelProps> = ({ blocks, isLoading, onBlockSelect, onAddressSelect }) => {
  if (isLoading) {
    return <Card title="Latest Blocks"><LoadingSpinner /></Card>;
  }

  return (
    <Card title="Latest Blocks" icon={typeof CubeIcon !== 'undefined' ? <CubeIcon className="w-6 h-6"/> : <CubeIconPlaceholder className="w-6 h-6"/>}>
      <div className="flow-root">
        <ul role="list" className="-mb-4">
          {blocks.map((block, index) => (
            <li key={block.id} className={`py-3 ${index < blocks.length -1 ? 'border-b border-slate-700' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <div className="md:col-span-1">
                  <button 
                    onClick={() => onBlockSelect(block.id)}
                    className="text-sky-400 hover:text-sky-300 hover:underline font-medium text-left"
                  >
                    Block #{block.id}
                  </button>
                  <p className="text-xs text-slate-400">{formatTimestamp(block.timestamp)}</p>
                </div>
                <div className="md:col-span-2 text-sm">
                  <p className="truncate">
                    <span className="text-slate-400">Miner: </span> 
                    <button 
                      onClick={() => onAddressSelect(block.miner)}
                      className="text-sky-400 hover:text-sky-300 hover:underline"
                      title={block.miner}
                    >
                      {`${block.miner.substring(0,10)}...${block.miner.substring(block.miner.length - 8)}`}
                    </button>
                  </p>
                  <p className="text-slate-300">{block.transactionHashes.length} Txns</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default LatestBlocksPanel;
