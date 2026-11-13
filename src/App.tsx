import { useCallback, useEffect, useState } from 'react';
import {
  GeneratorOptions,
  IdentityRecord,
  formatIdentityPlain,
  generateBatch,
  generateIdentity,
} from './data/identities';
import { HardwareTopBar } from './components/HardwareTopBar';
import { InstrumentDeck } from './components/InstrumentDeck';
import { BatchExportSection } from './components/BatchExportSection';
import { FieldGuideSection } from './components/FieldGuideSection';

const THEME_STORAGE_KEY = 'identitygen-chassis-theme';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [options, setOptions] = useState<GeneratorOptions>({
    gender: 'random',
    useNumbers: true,
    multipleFormats: true,
    passwordLength: 12,
  });

  const [historyList, setHistoryList] = useState<IdentityRecord[]>(() => {
    const initial = generateIdentity({
      gender: 'random',
      useNumbers: true,
      multipleFormats: true,
      passwordLength: 12,
    });
    return [initial];
  });

  const [currentIdentity, setCurrentIdentity] = useState<IdentityRecord | null>(
    () => historyList[0] ?? null
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const showQuickNotice = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 1800);
  }, []);

  const handleGenerate = useCallback(() => {
    const next = generateIdentity(options);
    setCurrentIdentity(next);
    setHistoryList((prev) => [next, ...prev].slice(0, 20));
  }, [options]);

  const handleGenerateBatch = useCallback(
    (count: number) => {
      const batch = generateBatch(options, count);
      setCurrentIdentity(batch[0]);
      setHistoryList((prev) => [...batch, ...prev].slice(0, 20));
      showQuickNotice(`Generated ${count} identities`);
    },
    [options, showQuickNotice]
  );

  const handleChangeOptions = useCallback((partial: Partial<GeneratorOptions>) => {
    setOptions((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistoryList([]);
    setCurrentIdentity(null);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
        return;
      }

      if (!currentIdentity) return;

      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        navigator.clipboard
          .writeText(formatIdentityPlain(currentIdentity))
          .then(() => showQuickNotice('Copied full identity'))
          .catch(() => {});
        return;
      }

      const keyMap: Record<string, { label: string; value: string }> = {
        '1': { label: 'First Name', value: currentIdentity.firstName },
        '2': { label: 'Last Name', value: currentIdentity.lastName },
        '3': { label: 'Email', value: currentIdentity.email },
        '4': { label: 'Password', value: currentIdentity.password },
        '5': {
          label: 'Gender',
          value:
            currentIdentity.gender.charAt(0).toUpperCase() +
            currentIdentity.gender.slice(1),
        },
      };

      const match = keyMap[e.key];
      if (match && !e.metaKey && !e.ctrlKey && !e.altKey) {
        navigator.clipboard
          .writeText(match.value)
          .then(() => showQuickNotice(`Copied ${match.label}`))
          .catch(() => {});
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleGenerate, currentIdentity, showQuickNotice]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      const root = document.documentElement;
      root.classList.toggle('dark', next === 'dark');
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F0] text-[#161615] dark:bg-[#141413] dark:text-[#F2F2F0] transition-colors duration-200">
      <HardwareTopBar onGenerate={handleGenerate} />

      <main className="flex-1">
        <InstrumentDeck
          options={options}
          onChangeOptions={handleChangeOptions}
          historyList={historyList}
          currentIdentity={currentIdentity}
          onSelectIdentity={setCurrentIdentity}
          onGenerate={handleGenerate}
          onClearHistory={handleClearHistory}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <BatchExportSection
          historyList={historyList}
          onGenerateBatch={handleGenerateBatch}
        />

        <FieldGuideSection />
      </main>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 rounded-sm border border-[#161615] bg-[#161615] px-4 py-2.5 text-xs font-mono font-medium text-white shadow-md dark:border-[#F2F2F0] dark:bg-[#F2F2F0] dark:text-[#161615]"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
