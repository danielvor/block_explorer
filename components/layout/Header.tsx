
import React from 'react';
import SearchBar from '../SearchBar'; // Corrected path
import { CubeTransparentIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  onSearch: (query: string) => void;
  onLogoClick: () => void;
  isSearchLoading: boolean;
}

// Placeholder for Heroicons if not directly available:
const CubeTransparentIconPlaceholder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6.19L8.03 9.06a.75.75 0 0 0-1.06 1.06L10.94 14H4.75a.75.75 0 0 0 0 1.5h6.19l-3.97 3.97a.75.75 0 1 0 1.06 1.06L11.25 16.56V22.5a.75.75 0 0 0 1.5 0v-5.94l3.97 3.97a.75.75 0 0 0 1.06-1.06L14.06 15.5h6.19a.75.75 0 0 0 0-1.5h-6.19l3.97-3.97a.75.75 0 1 0-1.06-1.06L12.75 12.19V6Z" clipRule="evenodd" />
  </svg>
);


const Header: React.FC<HeaderProps> = ({ onSearch, onLogoClick, isSearchLoading }) => {
  return (
    <header className="bg-slate-800/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onLogoClick}
          title="Go to Homepage"
        >
           {typeof CubeTransparentIcon !== 'undefined' ? <CubeTransparentIcon className="h-10 w-10 text-sky-500" /> : <CubeTransparentIconPlaceholder className="h-10 w-10 text-sky-500" />}
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Block <span className="text-sky-400">Explorer</span>
          </h1>
        </div>
        <SearchBar onSearch={onSearch} isLoading={isSearchLoading} />
      </div>
    </header>
  );
};

export default Header;
