import React from 'react';
import { Bus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', to = '/', showTagline = true, white = false }) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7 p-1.5', text: 'text-xl', tag: 'text-[9px]' },
    md: { icon: 'w-9 h-9 p-2', text: 'text-2xl', tag: 'text-[10px]' },
    lg: { icon: 'w-12 h-12 p-2.5', text: 'text-3xl', tag: 'text-xs' },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const content = (
    <div className="flex items-center gap-2.5 group select-none">
      <div
        className={`${currentSize.icon} rounded-xl bg-gradient-to-tr from-brand-darkred to-brand-red text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}
      >
        <Bus className="w-full h-full" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight leading-none">
          <span className={`font-black ${currentSize.text} ${white ? 'text-white' : 'text-brand-navy'}`}>
            Bus
          </span>
          <span className={`font-black ${currentSize.text} text-brand-red`}>
            Go
          </span>
        </div>
        {showTagline && (
          <span className={`${currentSize.tag} font-medium tracking-wider uppercase ${white ? 'text-gray-300' : 'text-brand-muted'} mt-0.5`}>
            Your Journey, Our Priority
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
