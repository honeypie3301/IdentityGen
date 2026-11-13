import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCw,
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GenderOption,
  GeneratorOptions,
  IdentityRecord,
  estimatePasswordEntropy,
  formatIdentityPlain,
} from '../data/identities';
import { NameDatabaseStats } from '../data/nameDatabase';
import { TactileSwitch } from './TactileSwitch';

interface InstrumentDeckProps {
  options: GeneratorOptions;
  onChangeOptions: (next: Partial<GeneratorOptions>) => void;
  historyList: IdentityRecord[];
  currentIdentity: IdentityRecord | null;
  onSelectIdentity: (item: IdentityRecord) => void;
  onGenerate: () => void;
  onRegeneratePassword: () => void;
  onClearHistory: () => void;
  dbStats: NameDatabaseStats;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const InstrumentDeck: React.FC<InstrumentDeckProps> = ({
  options,
  onChangeOptions,
  historyList,
  currentIdentity,
  onSelectIdentity,
  onGenerate,
  onRegeneratePassword,
  onClearHistory,
  dbStats,
  theme,
  onToggleTheme,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [lengthInput, setLengthInput] = useState<string>(String(options.passwordLength));

  useEffect(() => {
    setLengthInput(String(options.passwordLength));
  }, [options.passwordLength]);

  const passwordEntropy = useMemo(
    () => (currentIdentity ? estimatePasswordEntropy(currentIdentity.password) : null),
    [currentIdentity]
  );

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const commitLength = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setLengthInput(String(options.passwordLength));
      return;
    }
    const clamped = Math.min(64, Math.max(6, parsed));
    setLengthInput(String(clamped));
    onChangeOptions({ passwordLength: clamped });
  };

  const genderChoices: { label: string; value: GenderOption }[] = [
    { label: 'Random', value: 'random' },
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
  ];

  const passwordLengthChoices = [12, 16, 20];

  const poolSourceLabel =
    dbStats.source === 'online+local'
      ? 'Online + Local Pool'
      : dbStats.source === 'local-file'
      ? 'Local File Pool'
      : 'Embedded Fallback';

  const fieldRows = currentIdentity
    ? [
        {
          key: 'firstName',
          shortcut: '1',
          label: 'First Name',
          value: currentIdentity.firstName,
        },
        {
          key: 'lastName',
          shortcut: '2',
          label: 'Last Name',
          value: currentIdentity.lastName,
        },
        {
          key: 'email',
          shortcut: '3',
          label: 'Email Address',
          value: currentIdentity.email,
        },
        {
          key: 'password',
          shortcut: '4',
          label: 'Password',
          value: currentIdentity.password,
          isPassword: true,
        },
        {
          key: 'gender',
          shortcut: '5',
          label: 'Gender',
          value:
            currentIdentity.gender.charAt(0).toUpperCase() +
            currentIdentity.gender.slice(1),
        },
      ]
    : [];

  const activeSegments =
    passwordEntropy?.strength === 'strong'
      ? 3
      : passwordEntropy?.strength === 'good'
      ? 2
      : 1;

  const strengthTextColor =
    passwordEntropy?.strength === 'strong'
      ? 'text-[#15803D] dark:text-[#4ADE80]'
      : passwordEntropy?.strength === 'good'
      ? 'text-[#B45309] dark:text-[#FBBF24]'
      : 'text-[#B91C1C] dark:text-[#F87171]';

  const strengthBarColor =
    passwordEntropy?.strength === 'strong'
      ? 'bg-[#16A34A] dark:bg-[#22C55E]'
      : passwordEntropy?.strength === 'good'
      ? 'bg-[#D97706] dark:bg-[#F59E0B]'
      : 'bg-[#DC2626] dark:bg-[#EF4444]';

  return (
    <section id="instrument" className="mx-auto max-w-[1200px] px-4 pt-4 pb-4 sm:px-6 lg:px-8">
      {/* Compact Intro & Chassis Utility Toolbar */}
      <div className="mb-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] tracking-wide tabular-nums">
            {poolSourceLabel} · {dbStats.totalNames.toLocaleString()} names · 20-Slot Memory
          </p>
          <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-[#161615] dark:text-[#F2F2F0] [text-wrap:balance]">
            Identity Synthesizer
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="hardware-keycap inline-flex min-h-[38px] items-center gap-2 rounded-sm border border-[#C7C7C2] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#161615] hover:border-[#161615] dark:border-[#333330] dark:bg-[#1E1E1C] dark:text-[#F2F2F0] dark:hover:border-[#6B6B66] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FF4D00]"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span>Graphite Finish</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span>Silver Finish</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClearHistory}
            disabled={historyList.length === 0}
            className="hardware-keycap inline-flex min-h-[38px] items-center gap-2 rounded-sm border border-[#C7C7C2] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#5A5A55] hover:border-[#161615] hover:text-[#161615] disabled:opacity-40 disabled:cursor-not-allowed dark:border-[#333330] dark:bg-[#1E1E1C] dark:text-[#A3A39D] dark:hover:border-[#6B6B66] dark:hover:text-[#F2F2F0] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FF4D00]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Memory</span>
          </button>
        </div>
      </div>

      {/* Main Machined Aluminum Chassis */}
      <div className="border border-[#C7C7C2] bg-[#FFFFFF] dark:border-[#2F2F2C] dark:bg-[#1A1A18] rounded-sm overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Rail: Synthesis Controls + Memory Bank */}
          <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#D6D6D2] dark:border-[#2B2B28] flex flex-col">
            {/* Section 01: Synthesis Parameters */}
            <div className="p-4 sm:p-5 border-b border-[#D6D6D2] dark:border-[#2B2B28]">
              <h2 className="text-xs font-semibold tracking-wide text-[#5A5A55] dark:text-[#A3A39D] mb-3">
                01. Synthesis Controls
              </h2>

              {/* Gender Tactile Key Strip */}
              <div className="mb-3.5">
                <span className="block text-xs font-medium text-[#5A5A55] dark:text-[#A3A39D] mb-1.5">
                  Gender Profile
                </span>
                <div
                  role="group"
                  aria-label="Gender Profile"
                  className="grid grid-cols-3 gap-1 bg-[#E9E9E6] p-1 rounded-sm border border-[#D6D6D2] dark:bg-[#121211] dark:border-[#2B2B28]"
                >
                  {genderChoices.map((choice) => {
                    const active = options.gender === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() => onChangeOptions({ gender: choice.value })}
                        className={`hardware-keycap relative min-h-[36px] px-2 py-1.5 text-xs font-semibold rounded-[2px] cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#FF4D00] ${
                          active
                            ? 'bg-[#161615] text-white dark:bg-[#F2F2F0] dark:text-[#161615]'
                            : 'bg-transparent text-[#5A5A55] hover:text-[#161615] hover:bg-[#FFFFFF]/60 dark:text-[#9E9E98] dark:hover:text-[#F2F2F0] dark:hover:bg-[#1E1E1C]'
                        }`}
                      >
                        <span>{choice.label}</span>
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 bg-[#FF4D00]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password Length Presets + Custom Numeric Input */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password-length-input"
                    className="text-xs font-medium text-[#5A5A55] dark:text-[#A3A39D]"
                  >
                    Password Length
                  </label>
                  <span className="text-[11px] font-mono tabular-nums text-[#6B6B66] dark:text-[#8E8E88]">
                    6–64 chars
                  </span>
                </div>
                <div className="flex items-stretch gap-1.5">
                  <div
                    role="group"
                    aria-label="Password Length Presets"
                    className="grid flex-1 grid-cols-3 gap-1 bg-[#E9E9E6] p-1 rounded-sm border border-[#D6D6D2] dark:bg-[#121211] dark:border-[#2B2B28]"
                  >
                    {passwordLengthChoices.map((len) => {
                      const active = options.passwordLength === len;
                      return (
                        <button
                          key={len}
                          type="button"
                          onClick={() => onChangeOptions({ passwordLength: len })}
                          className={`hardware-keycap min-h-[34px] px-2 py-1 text-xs font-mono font-medium tabular-nums rounded-[2px] cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#FF4D00] ${
                            active
                              ? 'bg-[#161615] text-white dark:bg-[#F2F2F0] dark:text-[#161615]'
                              : 'bg-transparent text-[#5A5A55] hover:text-[#161615] hover:bg-[#FFFFFF]/60 dark:text-[#9E9E98] dark:hover:text-[#F2F2F0] dark:hover:bg-[#1E1E1C]'
                          }`}
                        >
                          {len}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    id="password-length-input"
                    type="number"
                    min={6}
                    max={64}
                    value={lengthInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLengthInput(val);
                      const parsed = parseInt(val, 10);
                      if (!Number.isNaN(parsed) && parsed >= 6 && parsed <= 64) {
                        onChangeOptions({ passwordLength: parsed });
                      }
                    }}
                    onBlur={() => commitLength(lengthInput)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        commitLength(lengthInput);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    aria-label="Custom password length"
                    className="w-16 rounded-sm border border-[#C7C7C2] bg-[#F7F7F5] px-2 py-1 text-center font-mono text-xs font-semibold tabular-nums text-[#161615] focus:border-[#FF4D00] focus:outline-none dark:border-[#333330] dark:bg-[#121211] dark:text-[#F2F2F0] dark:focus:border-[#FF4D00]"
                  />
                </div>
              </div>

              {/* Mechanical Switches */}
              <div className="divide-y divide-[#E5E5E0] dark:divide-[#262623]">
                <TactileSwitch
                  id="switch-numbers"
                  label="Include Numbers"
                  checked={options.useNumbers}
                  onChange={(val) => onChangeOptions({ useNumbers: val })}
                />
                <TactileSwitch
                  id="switch-formats"
                  label="Multiple Formats"
                  checked={options.multipleFormats}
                  onChange={(val) => onChangeOptions({ multipleFormats: val })}
                />
              </div>
            </div>

            {/* Section 02: 20-Slot Memory Bank */}
            <div className="flex flex-1 flex-col min-h-[190px]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E5E0] dark:border-[#262623] bg-[#F7F7F5] dark:bg-[#161614]">
                <h2 className="text-xs font-semibold tracking-wide text-[#5A5A55] dark:text-[#A3A39D]">
                  02. Memory Bank
                </h2>
                <span className="text-xs font-mono tabular-nums text-[#6B6B66] dark:text-[#8E8E88]">
                  {historyList.length} / 20
                </span>
              </div>

              {historyList.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
                  <p className="text-sm font-medium text-[#5A5A55] dark:text-[#A3A39D]">
                    Memory bank empty
                  </p>
                  <p className="mt-1 text-xs text-[#6B6B66] dark:text-[#8E8E88]">
                    Generate an identity to populate slot 01.
                  </p>
                </div>
              ) : (
                <div className="hardware-scroll flex-1 max-h-[205px] lg:max-h-[225px] overflow-y-auto divide-y divide-[#EFEFEA] dark:divide-[#242421]">
                  {historyList.map((item, idx) => {
                    const isActive = currentIdentity?.id === item.id;
                    const slotLabel = String(idx + 1).padStart(2, '0');
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectIdentity(item)}
                        className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#FF4D00] ${
                          isActive
                            ? 'bg-[#EFEFEB] dark:bg-[#242421]'
                            : 'hover:bg-[#F7F7F5] dark:hover:bg-[#1E1E1C]'
                        }`}
                      >
                        <span
                          className={`text-xs font-mono font-semibold tabular-nums shrink-0 ${
                            isActive
                              ? 'text-[#FF4D00]'
                              : 'text-[#8C8C85] dark:text-[#6E6E68]'
                          }`}
                        >
                          {slotLabel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm font-medium truncate ${
                              isActive
                                ? 'text-[#161615] dark:text-white'
                                : 'text-[#3D3D3A] dark:text-[#CCCCCC]'
                            }`}
                          >
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="text-xs font-mono truncate text-[#6B6B66] dark:text-[#8E8E88]">
                            {item.email}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Right Deck: High-Contrast OLED Readout & Field Matrix */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {!currentIdentity ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[360px]">
                <p className="text-base font-semibold text-[#161615] dark:text-[#F2F2F0]">
                  No active identity loaded
                </p>
                <p className="mt-1.5 text-sm text-[#6B6B66] dark:text-[#9E9E98] max-w-sm">
                  Press Generate Identity or hit Space to synthesize a fresh test identity.
                </p>
                <button
                  type="button"
                  onClick={onGenerate}
                  className="hardware-keycap mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-sm bg-[#FF4D00] px-5 py-2 text-sm font-semibold text-white hover:bg-[#E04400] cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Generate First Identity</span>
                </button>
              </div>
            ) : (
              <>
                {/* Recessed High-Contrast OLED Readout Screen */}
                <div className="p-4 sm:p-5 border-b border-[#D6D6D2] dark:border-[#2B2B28]">
                  <div className="rounded-sm bg-[#161615] dark:bg-[#0D0D0C] border border-[#2C2C29] p-4 sm:p-5 text-[#F5F5F3]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentIdentity.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                          className="min-w-0"
                        >
                          <div className="flex items-center gap-2 text-xs font-mono text-[#A3A39D]">
                            <span>Active Readout</span>
                            <span aria-hidden="true">·</span>
                            <span className="capitalize">{currentIdentity.gender}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{currentIdentity.createdAt}</span>
                          </div>
                          <h2 className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-white [text-wrap:balance]">
                            {currentIdentity.firstName} {currentIdentity.lastName}
                          </h2>
                          <p className="mt-1 font-mono text-sm text-[#FF7A45] break-all">
                            {currentIdentity.email}
                          </p>
                        </motion.div>
                      </AnimatePresence>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={onGenerate}
                          className="hardware-keycap inline-flex min-h-[38px] items-center gap-1.5 rounded-sm bg-[#FF4D00] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#E04400] cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>New</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy('all', formatIdentityPlain(currentIdentity))
                          }
                          className={`hardware-keycap inline-flex min-h-[38px] items-center gap-1.5 rounded-sm border px-3.5 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4D00] ${
                            copiedKey === 'all'
                              ? 'border-[#22C55E] bg-[#14532D]/40 text-[#86EFAC]'
                              : 'border-[#3D3D39] bg-[#242422] text-[#F5F5F3] hover:border-[#6B6B66] hover:bg-[#2E2E2B]'
                          }`}
                        >
                          {copiedKey === 'all' ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Copied All</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy All</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Machined Credential Field Matrix */}
                <div className="flex-1 divide-y divide-[#E5E5E0] dark:divide-[#262623]">
                  {fieldRows.map((row) => {
                    const isCopied = copiedKey === row.key;
                    const displayValue =
                      row.isPassword && !showPassword
                        ? '•'.repeat(row.value.length)
                        : row.value;

                    return (
                      <div
                        key={row.key}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 hover:bg-[#F9F9F7] dark:hover:bg-[#1F1F1D] transition-colors duration-150"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6B66] dark:text-[#9E9E98]">
                            <span className="font-mono tabular-nums text-[#8C8C85] dark:text-[#6E6E68]">
                              [{row.shortcut}]
                            </span>
                            <span className="font-medium">{row.label}</span>
                            {row.isPassword && passwordEntropy && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {row.value.length} chars
                                </span>
                                <span aria-hidden="true">·</span>
                                <span
                                  className="inline-flex items-center gap-1.5"
                                  aria-label={`Password strength: ${passwordEntropy.label}, ${passwordEntropy.bits} bits of entropy`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className="inline-flex items-center gap-0.5"
                                  >
                                    {[1, 2, 3].map((segment) => (
                                      <span
                                        key={segment}
                                        className={`h-1.5 w-3.5 rounded-[1px] transition-colors duration-150 ${
                                          segment <= activeSegments
                                            ? strengthBarColor
                                            : 'bg-[#D6D6D2] dark:bg-[#2F2F2C]'
                                        }`}
                                      />
                                    ))}
                                  </span>
                                  <span className={`font-semibold ${strengthTextColor}`}>
                                    {passwordEntropy.label}
                                  </span>
                                  <span className="font-mono tabular-nums text-[#6B6B66] dark:text-[#8E8E88]">
                                    ({passwordEntropy.bits} bits)
                                  </span>
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-0.5 font-mono text-sm font-medium text-[#161615] dark:text-[#F2F2F0] break-all tabular-nums">
                            {displayValue}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {row.isPassword && (
                            <>
                              <button
                                type="button"
                                onClick={onRegeneratePassword}
                                title="Regenerate password"
                                aria-label="Regenerate password"
                                className="hardware-keycap inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-sm border border-[#D6D6D2] bg-[#F7F7F5] px-2.5 py-1.5 text-xs font-medium text-[#5A5A55] hover:border-[#161615] hover:text-[#161615] dark:border-[#333330] dark:bg-[#222220] dark:text-[#A3A39D] dark:hover:border-[#6B6B66] dark:hover:text-[#F2F2F0] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF4D00]"
                              >
                                <RotateCw className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="hardware-keycap inline-flex min-h-[36px] min-w-[36px] items-center justify-center gap-1.5 rounded-sm border border-[#D6D6D2] bg-[#F7F7F5] px-2.5 py-1.5 text-xs font-medium text-[#5A5A55] hover:border-[#161615] hover:text-[#161615] dark:border-[#333330] dark:bg-[#222220] dark:text-[#A3A39D] dark:hover:border-[#6B6B66] dark:hover:text-[#F2F2F0] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF4D00]"
                              >
                                {showPassword ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Hide</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Show</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopy(row.key, row.value)}
                            className={`hardware-keycap inline-flex min-h-[36px] min-w-[84px] items-center justify-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#FF4D00] ${
                              isCopied
                                ? 'border-[#16A34A] bg-[#DCFCE7] text-[#166534] dark:border-[#22C55E] dark:bg-[#14532D]/40 dark:text-[#86EFAC]'
                                : 'border-[#D6D6D2] bg-[#F7F7F5] text-[#161615] hover:border-[#161615] hover:bg-[#EFEFEB] dark:border-[#333330] dark:bg-[#222220] dark:text-[#F2F2F0] dark:hover:border-[#6B6B66] dark:hover:bg-[#2B2B28]'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
