import { sampleFirstName, sampleLastName } from './nameDatabase';

export type GenderOption = 'random' | 'female' | 'male';

export interface GeneratorOptions {
  gender: GenderOption;
  useNumbers: boolean;
  multipleFormats: boolean;
  passwordLength: number;
}

export interface IdentityRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female';
  password: string;
  createdAt: string;
}

export type PasswordStrengthLevel = 'weak' | 'good' | 'strong';

export interface PasswordEntropyEstimate {
  bits: number;
  strength: PasswordStrengthLevel;
  label: 'Weak' | 'Good' | 'Strong';
  poolSize: number;
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*';
const ALL_CHARS = UPPER + LOWER + DIGITS + SYMBOLS;

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    const buf = new Uint32Array(1);
    while (true) {
      crypto.getRandomValues(buf);
      if (buf[0] < limit) {
        return buf[0] % maxExclusive;
      }
    }
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function generatePassword(length: number = 12): string {
  const safeLength = Math.min(64, Math.max(6, Math.round(length)));
  const chars: string[] = [
    UPPER[secureRandomInt(UPPER.length)],
    LOWER[secureRandomInt(LOWER.length)],
    DIGITS[secureRandomInt(DIGITS.length)],
    SYMBOLS[secureRandomInt(SYMBOLS.length)],
  ];

  while (chars.length < safeLength) {
    chars.push(ALL_CHARS[secureRandomInt(ALL_CHARS.length)]);
  }

  // Fisher-Yates shuffle via CSPRNG
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }

  return chars.join('');
}

export function estimatePasswordEntropy(password: string): PasswordEntropyEstimate {
  const length = password.length;
  if (length === 0) {
    return { bits: 0, strength: 'weak', label: 'Weak', poolSize: 0 };
  }

  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSymbol = false;
  let hasExtendedSymbol = false;
  const uniqueChars = new Set<string>();

  for (let i = 0; i < length; i++) {
    const ch = password[i];
    uniqueChars.add(ch);
    const code = ch.charCodeAt(0);
    if (code >= 97 && code <= 122) {
      hasLower = true;
    } else if (code >= 65 && code <= 90) {
      hasUpper = true;
    } else if (code >= 48 && code <= 57) {
      hasDigit = true;
    } else {
      hasSymbol = true;
      if (!SYMBOLS.includes(ch)) {
        hasExtendedSymbol = true;
      }
    }
  }

  const poolSize =
    (hasLower ? 26 : 0) +
    (hasUpper ? 26 : 0) +
    (hasDigit ? 10 : 0) +
    (hasSymbol ? (hasExtendedSymbol ? 32 : SYMBOLS.length) : 0);

  let rawBits = poolSize > 1 ? length * Math.log2(poolSize) : 0;

  // Penalize low unique-character diversity (e.g., repeated patterns)
  const expectedSpace = Math.min(length, Math.max(1, poolSize));
  const diversityRatio = uniqueChars.size / expectedSpace;
  if (diversityRatio < 0.55) {
    rawBits *= diversityRatio / 0.55;
  }

  // Penalize consecutive identical runs (e.g., "aaa")
  let consecutiveRepeats = 0;
  for (let i = 1; i < length; i++) {
    if (password[i] === password[i - 1]) {
      consecutiveRepeats++;
    }
  }
  rawBits -= consecutiveRepeats * 3.5;

  // Penalize 3+ monotonic ascending/descending sequences (e.g., "abc", "321")
  let sequencePenalty = 0;
  for (let i = 2; i < length; i++) {
    const d1 = password.charCodeAt(i - 1) - password.charCodeAt(i - 2);
    const d2 = password.charCodeAt(i) - password.charCodeAt(i - 1);
    if ((d1 === 1 && d2 === 1) || (d1 === -1 && d2 === -1)) {
      sequencePenalty += 4;
    }
  }
  rawBits -= sequencePenalty;

  const bits = Math.max(0, Math.round(rawBits));

  if (bits < 55) {
    return { bits, strength: 'weak', label: 'Weak', poolSize };
  }
  if (bits < 80) {
    return { bits, strength: 'good', label: 'Good', poolSize };
  }
  return { bits, strength: 'strong', label: 'Strong', poolSize };
}

function normalizeEmailToken(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

export function generateIdentity(options: GeneratorOptions): IdentityRecord {
  let selectedGender: 'male' | 'female' = 'male';

  if (options.gender === 'female') {
    selectedGender = 'female';
  } else if (options.gender === 'random') {
    selectedGender = Math.random() > 0.5 ? 'female' : 'male';
  }

  const first = sampleFirstName(selectedGender) || 'John';
  const last = sampleLastName() || 'Doe';

  const fLow = normalizeEmailToken(first) || 'user';
  const lLow = normalizeEmailToken(last) || 'name';

  const formats: string[] = [];

  if (options.multipleFormats) {
    formats.push(`${fLow}.${lLow}@gmail.com`);
    formats.push(`${fLow}${lLow}@gmail.com`);
    formats.push(`${lLow}.${fLow}@gmail.com`);
  } else {
    formats.push(`${fLow}${lLow}@gmail.com`);
  }

  if (options.useNumbers) {
    const r1 = Math.floor(Math.random() * 8999999) + 1000000;
    const r2 = Math.floor(Math.random() * 89999) + 10000;
    formats.push(`${fLow}${r1}@gmail.com`);
    if (options.multipleFormats) {
      formats.push(`${fLow}.${lLow}${r2}@gmail.com`);
    }
  }

  const email = formats[Math.floor(Math.random() * formats.length)];
  const password = generatePassword(options.passwordLength);
  const id = Math.random().toString(36).substring(2, 9);
  const now = new Date();
  const createdAt = now.toTimeString().slice(0, 8);

  return {
    id,
    firstName: first,
    lastName: last,
    email,
    gender: selectedGender,
    password,
    createdAt,
  };
}

export function generateBatch(options: GeneratorOptions, count: number): IdentityRecord[] {
  const results: IdentityRecord[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generateIdentity(options));
  }
  return results;
}

export function formatIdentityPlain(identity: IdentityRecord): string {
  const formattedGender = identity.gender.charAt(0).toUpperCase() + identity.gender.slice(1);
  return [
    `First Name: ${identity.firstName}`,
    `Last Name: ${identity.lastName}`,
    `Email: ${identity.email}`,
    `Password: ${identity.password}`,
    `Gender: ${formattedGender}`,
  ].join('\n');
}

export function formatListAsCsv(items: IdentityRecord[]): string {
  const header = 'First Name,Last Name,Email,Password,Gender,Generated At';
  const rows = items.map(
    (item) =>
      `"${item.firstName}","${item.lastName}","${item.email}","${item.password.replace(/"/g, '""')}","${item.gender}","${item.createdAt}"`
  );
  return [header, ...rows].join('\n');
}

export function formatListAsPlain(items: IdentityRecord[]): string {
  return items
    .map((item, idx) => `[${String(idx + 1).padStart(2, '0')}]\n${formatIdentityPlain(item)}`)
    .join('\n\n');
}
