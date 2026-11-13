import React from 'react';

interface TactileSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const TactileSwitch: React.FC<TactileSwitchProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 min-h-[44px]">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[#161615] dark:text-[#F2F2F0] cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-[#6B6B66] dark:text-[#9E9E98] mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-sm border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4D00] ${
          checked
            ? 'bg-[#161615] border-[#161615] dark:bg-[#F2F2F0] dark:border-[#F2F2F0]'
            : 'bg-[#E3E3DF] border-[#C7C7C2] dark:bg-[#242422] dark:border-[#3A3A36]'
        }`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-[2px] shadow-xs transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            checked
              ? 'translate-x-[26px] bg-[#FF4D00]'
              : 'translate-x-[3px] bg-[#FFFFFF] dark:bg-[#52524D]'
          }`}
        >
          <span
            className={`h-2 w-0.5 rounded-full ${
              checked ? 'bg-white' : 'bg-[#A1A19B] dark:bg-[#242422]'
            }`}
          />
        </span>
      </button>
    </div>
  );
};
