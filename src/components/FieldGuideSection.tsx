import React from 'react';

export const FieldGuideSection: React.FC = () => {
  const shortcuts = [
    { keycap: 'Space', action: 'New identity' },
    { keycap: 'C', action: 'Copy all fields' },
    { keycap: '1–5', action: 'Copy field' },
  ];

  return (
    <section
      id="field-guide"
      className="mx-auto max-w-[1200px] px-4 pb-6 sm:px-6 lg:px-8"
    >
      <div className="border-t border-[#D6D6D2] dark:border-[#2B2B28] pt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-[#5A5A55] dark:text-[#9E9E98]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {shortcuts.map((item) => (
            <div key={item.keycap} className="flex items-center gap-1.5">
              <kbd className="font-mono text-[11px] font-semibold text-[#161615] dark:text-[#F2F2F0] bg-[#E5E5E0] dark:bg-[#242422] border border-[#C7C7C2] dark:border-[#3A3A36] px-1.5 py-0.5 rounded-[2px] whitespace-nowrap">
                {item.keycap}
              </kbd>
              <span>{item.action}</span>
            </div>
          ))}
        </div>

        <p className="font-mono text-[11px] text-[#6B6B66] dark:text-[#8E8E88]">
          100% Local Browser Synthesis · Zero Network Requests
        </p>
      </div>
    </section>
  );
};
