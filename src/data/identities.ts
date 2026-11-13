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

export const maleNames = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
  "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Kenneth", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan",
  "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon",
  "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry",
  "Tyler", "Aaron", "Jose", "Adam", "Henry", "Nathan", "Douglas", "Zachary", "Peter", "Kyle", "Walter",
  "Ethan", "Jeremy", "Christian", "Keith", "Roger", "Terry", "Gerald", "Sean", "Arthur", "Lawrence",
  "Dylan", "Jesse", "Austin", "Bruce", "Joe", "Gabriel", "Logan", "Albert", "Willie", "Alan", "Juan",
  "Wayne", "Elijah", "Randy", "Roy", "Vincent", "Ralph", "Eugene", "Russell", "Bobby", "Mason", "Philip"
];

export const femaleNames = [
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
  "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
  "Dorothy", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura",
  "Cynthia", "Kathleen", "Amy", "Shirley", "Angela", "Helen", "Anna", "Brenda", "Pamela", "Nicole",
  "Emma", "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Catherine", "Carolyn", "Janet",
  "Ruth", "Maria", "Heather", "Diane", "Virginia", "Julie", "Joyce", "Victoria", "Olivia", "Kelly",
  "Christina", "Lauren", "Joan", "Evelyn", "Judith", "Megan", "Cheryl", "Andrea", "Hannah", "Martha",
  "Jacqueline", "Lucille", "Frances", "Gloria", "Ann", "Teresa", "Kathryn", "Sara", "Janice", "Jean",
  "Alice", "Madison", "Doris", "Abigail", "Julia", "Judy", "Grace", "Denise", "Amber", "Marilyn", "Beverly"
];

export const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson",
  "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis",
  "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
  "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter",
  "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins",
  "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan",
  "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
  "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price"
];

export function generatePassword(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function generateIdentity(options: GeneratorOptions): IdentityRecord {
  let firstNamesList = maleNames;
  let selectedGender: 'male' | 'female' = 'male';

  if (options.gender === 'female') {
    firstNamesList = femaleNames;
    selectedGender = 'female';
  } else if (options.gender === 'random') {
    if (Math.random() > 0.5) {
      firstNamesList = femaleNames;
      selectedGender = 'female';
    }
  }

  const first = firstNamesList[Math.floor(Math.random() * firstNamesList.length)] || "John";
  const last = lastNames[Math.floor(Math.random() * lastNames.length)] || "Doe";

  const fLow = first.toLowerCase().replace(/[^a-z]/g, '');
  const lLow = last.toLowerCase().replace(/[^a-z]/g, '');

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
  return items.map((item, idx) => `[${String(idx + 1).padStart(2, '0')}]\n${formatIdentityPlain(item)}`).join('\n\n');
}
