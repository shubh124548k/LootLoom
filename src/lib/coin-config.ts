export const COINS_PER_INR = 30;

export function coinsToInr(coins: number): number {
  return Math.round(coins / COINS_PER_INR);
}

export function inrToCoins(inr: number): number {
  return inr * COINS_PER_INR;
}

export const REWARD_TIERS = [
  { value: 10, coins: inrToCoins(10) },
  { value: 20, coins: inrToCoins(20) },
  { value: 30, coins: inrToCoins(30) },
  { value: 40, coins: inrToCoins(40) },
  { value: 50, coins: inrToCoins(50) },
  { value: 100, coins: inrToCoins(100) },
  { value: 200, coins: inrToCoins(200) },
  { value: 500, coins: inrToCoins(500) },
  { value: 1000, coins: inrToCoins(1000) },
];
