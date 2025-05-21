
import React from 'react';
import Card from './common/Card';
import { MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';

interface NotFoundContentProps {
  query?: string;
}

const MagnifyingGlassMinusIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6" />
  </svg>
);


const NotFoundContent: React.FC<NotFoundContentProps> = ({ query }) => {
  return (
    <Card className="text-center">
      <div className="flex flex-col items-center">
        {typeof MagnifyingGlassMinusIcon !== 'undefined' ? 
            <MagnifyingGlassMinusIcon className="w-16 h-16 text-amber-500 mb-4" /> : 
            <MagnifyingGlassMinusIconPlaceholder className="w-16 h-16 text-amber-500 mb-4" />
        }
        <h2 className="text-2xl font-semibold text-amber-400 mb-2">Search Not Found</h2>
        {query ? (
          <p className="text-slate-300">
            Sorry, we couldn't find any results for: <strong className="text-slate-100">{query}</strong>
          </p>
        ) : (
          <p className="text-slate-300">Sorry, the requested item could not be found.</p>
        )}
        <p className="text-slate-400 mt-1 text-sm">Please check your query or try a different search term.</p>
      </div>
    </Card>
  );
};

export default NotFoundContent;
