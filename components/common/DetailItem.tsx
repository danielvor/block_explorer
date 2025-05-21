
import React from 'react';

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  isHash?: boolean;
  onNavigate?: (value: string) => void;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, isHash = false, onNavigate, className = '' }) => {
  const valueContent = typeof value === 'string' && isHash && value.length > 20 
    ? `${value.substring(0, 10)}...${value.substring(value.length - 8)}`
    : value;

  return (
    <div className={`py-2 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
      <dt className="text-sm font-medium text-slate-400">{label}:</dt>
      <dd className="mt-1 text-sm text-slate-200 sm:mt-0 sm:col-span-2 break-all">
        {isHash && onNavigate && typeof value === 'string' ? (
          <button
            onClick={() => onNavigate(value)}
            className="text-sky-400 hover:text-sky-300 hover:underline focus:outline-none"
            title={value}
          >
            {valueContent}
          </button>
        ) : (
          valueContent
        )}
      </dd>
    </div>
  );
};

export default DetailItem;
