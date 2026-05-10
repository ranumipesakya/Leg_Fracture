import React from 'react';
import { FaBone } from 'react-icons/fa';

interface LoadingScreenProps {
  fullPage?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullPage = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullPage ? 'fixed inset-0 z-[100] bg-[#F0F7FF] dark:bg-slate-950' : 'w-full py-10'} animate-in fade-in duration-700`}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-[3px] border-blue-500/10 rounded-full" />
        <div className="absolute inset-0 border-[3px] border-transparent border-t-blue-500 rounded-full animate-[spin_1.5s_linear_infinite]" />
        
        {/* Middle Ring */}
        <div className="absolute inset-2 border-2 border-indigo-500/10 rounded-full" />
        <div className="absolute inset-2 border-2 border-transparent border-b-indigo-500 rounded-full animate-[spin_2.5s_linear_infinite_reverse]" />
        
        {/* Inner Core Glow */}
        <div className="absolute inset-5 bg-blue-500/5 blur-lg rounded-full animate-pulse" />
        
        {/* Pulsing Bone Icon */}
        <div className="relative z-10">
          <FaBone className="text-xl text-blue-600 animate-pulse drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        </div>
        
        {/* Scanning Line Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      </div>
      
      {/* Subtle Progress Dots (Alternative to Text) */}
      <div className="mt-5 flex gap-1">
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

export default LoadingScreen;
