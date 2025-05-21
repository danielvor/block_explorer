
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', icon }) => {
  return (
    <div className={`bg-slate-800 shadow-xl rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className={`p-4 border-b border-slate-700 flex items-center justify-between ${titleClassName}`}>
          <h2 className="text-lg font-semibold text-sky-400">{title}</h2>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
      )}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
