import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HardwareTopBarProps {
  onGenerate: () => void;
}

export const HardwareTopBar: React.FC<HardwareTopBarProps> = ({ onGenerate }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#D6D6D2] bg-[#F2F2F0]/95 backdrop-blur-sm dark:border-[#2B2B28] dark:bg-[#141413]/95">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-4 py-2.5 sm:px-6 lg:px-8">
        <a
          href="#instrument"
          className="text-base font-bold tracking-tight text-[#161615] dark:text-[#F2F2F0] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF4D00]"
        >
          IdentityGen
        </a>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onGenerate}
            className="hardware-keycap inline-flex min-h-[38px] items-center gap-2 rounded-sm bg-[#FF4D00] px-4 py-1.5 text-xs font-semibold tracking-wide text-white hover:bg-[#E04400] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#161615] dark:focus-visible:outline-white"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span>Generate Identity</span>
          </button>
        </div>
      </div>
    </header>
  );
};
