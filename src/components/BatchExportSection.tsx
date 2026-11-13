import React, { useState } from 'react';
import { Check, Copy, Download, Layers } from 'lucide-react';
import {
  IdentityRecord,
  formatListAsCsv,
  formatListAsPlain,
} from '../data/identities';

interface BatchExportSectionProps {
  historyList: IdentityRecord[];
  onGenerateBatch: (count: number) => void;
}

export const BatchExportSection: React.FC<BatchExportSectionProps> = ({
  historyList,
  onGenerateBatch,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyBuffer = async (format: 'json' | 'csv' | 'txt') => {
    if (historyList.length === 0) return;
    let payload = '';
    if (format === 'json') {
      payload = JSON.stringify(historyList, null, 2);
    } else if (format === 'csv') {
      payload = formatListAsCsv(historyList);
    } else {
      payload = formatListAsPlain(historyList);
    }

    try {
      await navigator.clipboard.writeText(payload);
      setCopiedFormat(format);
      window.setTimeout(() => {
        setCopiedFormat((prev) => (prev === format ? null : prev));
      }, 1800);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <section
      id="batch-export"
      className="mx-auto max-w-[1200px] px-4 pb-4 sm:px-6 lg:px-8"
    >
      <div className="border border-[#C7C7C2] bg-[#FFFFFF] dark:border-[#2F2F2C] dark:bg-[#1A1A18] rounded-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D6D6D2] dark:divide-[#2B2B28]">
          {/* Left: Batch Generator */}
          <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A5A55] dark:text-[#A3A39D]">
                <Layers className="h-3.5 w-3.5 text-[#FF4D00]" />
                <span>03. Batch Synthesizer</span>
              </div>
              <p className="mt-1 text-xs text-[#6B6B66] dark:text-[#9E9E98]">
                Fill the 20-slot memory buffer in one click.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {[5, 10, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onGenerateBatch(count)}
                  className="hardware-keycap inline-flex min-h-[38px] items-center justify-center rounded-sm border border-[#C7C7C2] bg-[#F7F7F5] px-3 py-1.5 text-xs font-mono font-semibold tabular-nums text-[#161615] hover:border-[#161615] hover:bg-[#EFEFEB] dark:border-[#333330] dark:bg-[#222220] dark:text-[#F2F2F0] dark:hover:border-[#6B6B66] dark:hover:bg-[#2B2B28] cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#FF4D00]"
                >
                  +{count}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Session Export */}
          <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5A5A55] dark:text-[#A3A39D]">
                <span>04. Session Export</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#6B6B66] dark:text-[#8E8E88]">
                  {historyList.length} stored
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6B6B66] dark:text-[#9E9E98]">
                Download or copy active memory buffer.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(['json', 'csv', 'txt'] as const).map((fmt) => {
                const label = fmt.toUpperCase();
                const handleDownload = () => {
                  if (fmt === 'json') {
                    downloadFile(
                      JSON.stringify(historyList, null, 2),
                      'identitygen-export.json',
                      'application/json'
                    );
                  } else if (fmt === 'csv') {
                    downloadFile(
                      formatListAsCsv(historyList),
                      'identitygen-export.csv',
                      'text/csv'
                    );
                  } else {
                    downloadFile(
                      formatListAsPlain(historyList),
                      'identitygen-export.txt',
                      'text/plain'
                    );
                  }
                };
                return (
                  <div
                    key={fmt}
                    className="flex border border-[#D6D6D2] dark:border-[#333330] rounded-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      disabled={historyList.length === 0}
                      onClick={handleDownload}
                      className="hardware-keycap inline-flex min-h-[38px] items-center justify-center gap-1 bg-[#F7F7F5] px-2.5 py-1.5 text-xs font-mono font-semibold text-[#161615] hover:bg-[#EFEFEB] disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[#222220] dark:text-[#F2F2F0] dark:hover:bg-[#2B2B28] cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>{label}</span>
                    </button>
                    <button
                      type="button"
                      disabled={historyList.length === 0}
                      onClick={() => handleCopyBuffer(fmt)}
                      title={`Copy ${label} to clipboard`}
                      className="hardware-keycap inline-flex min-h-[38px] w-8 items-center justify-center border-l border-[#D6D6D2] bg-[#FFFFFF] text-[#5A5A55] hover:text-[#161615] disabled:opacity-40 disabled:cursor-not-allowed dark:border-[#333330] dark:bg-[#1A1A18] dark:text-[#A3A39D] dark:hover:text-[#F2F2F0] cursor-pointer"
                    >
                      {copiedFormat === fmt ? (
                        <Check className="h-3 w-3 text-[#16A34A]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
