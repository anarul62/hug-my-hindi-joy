const firstNames = [
  "Rahul", "Amit", "Priya", "Suresh", "Deepak", "Ankit", "Pooja", "Vikram",
  "Sanjay", "Neha", "Ravi", "Manish", "Kajal", "Ajay", "Rohit", "Sneha",
  "Gaurav", "Arun", "Meena", "Pawan", "Nitin", "Swati", "Raj", "Mohan",
  "Kiran", "Shiv", "Nisha", "Tushar", "Rekha", "Sachin", "Bharat", "Divya",
];

export const AVATARS = [
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-72.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-20.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-10.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-13.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-2.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-36.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-1.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-4.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-5.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-44.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-28.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-67.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-3.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-66.png",
  "https://aviator-demo.spribegaming.com/assets/static/avatars/v2/av-34.png",
];

export const randomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

export const randomName = () => {
  const name = firstNames[Math.floor(Math.random() * firstNames.length)];
  return name[0] + "***" + name[name.length - 1];
};

export const randomBetAmount = () => {
  const amounts = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const base = amounts[Math.floor(Math.random() * amounts.length)];
  return parseFloat((base + Math.random() * base * 0.5).toFixed(2));
};

export const randomMultiplier = () => {
  const r = Math.random();
  if (r < 0.3) return parseFloat((1 + Math.random() * 0.5).toFixed(2));
  if (r < 0.6) return parseFloat((1.5 + Math.random() * 2).toFixed(2));
  if (r < 0.85) return parseFloat((3 + Math.random() * 5).toFixed(2));
  return parseFloat((8 + Math.random() * 20).toFixed(2));
};

export type FakeBet = {
  user: string;
  avatar: string;
  amount: number;
  multiplier: number | null;
  cashout: number | null;
};

export const generateFakeBets = (count: number): FakeBet[] => {
  return Array.from({ length: count }, () => {
    const amount = randomBetAmount();
    const won = Math.random() > 0.45;
    const mult = won ? randomMultiplier() : null;
    return {
      user: randomName(),
      avatar: randomAvatar(),
      amount,
      multiplier: mult,
      cashout: mult ? parseFloat((amount * mult).toFixed(2)) : null,
    };
  });
};

export const generateCrashHistory = (count: number): number[] => {
  return Array.from({ length: count }, () => randomMultiplier());
};
