import { Level } from '@/types/game';

export const levels: Level[] = [
  { id: 1, enemyCount: 3, enemySpeed: 1, baseHealth: 200, reward: 50 },
  { id: 2, enemyCount: 5, enemySpeed: 1.2, baseHealth: 250, reward: 75 },
  { id: 3, enemyCount: 7, enemySpeed: 1.3, baseHealth: 300, reward: 100 },
  { id: 4, enemyCount: 8, enemySpeed: 1.5, baseHealth: 350, reward: 125 },
  { id: 5, enemyCount: 10, enemySpeed: 1.7, baseHealth: 400, reward: 150 },
  { id: 6, enemyCount: 12, enemySpeed: 1.8, baseHealth: 450, reward: 200 },
  { id: 7, enemyCount: 15, enemySpeed: 2, baseHealth: 500, reward: 250 },
  { id: 8, enemyCount: 18, enemySpeed: 2.2, baseHealth: 600, reward: 300 },
  { id: 9, enemyCount: 20, enemySpeed: 2.5, baseHealth: 700, reward: 400 },
  { id: 10, enemyCount: 25, enemySpeed: 2.8, baseHealth: 800, reward: 500 },
  { id: 11, enemyCount: 30, enemySpeed: 3, baseHealth: 1000, reward: 750 },
  { id: 12, enemyCount: 35, enemySpeed: 3.5, baseHealth: 1200, reward: 1000 },
];
