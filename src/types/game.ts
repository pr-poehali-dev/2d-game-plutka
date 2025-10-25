export interface Player {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  team: 'player' | 'enemy';
  size: number;
}

export interface Base {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  team: 'player' | 'enemy';
  size: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  damage: number;
  team: 'player' | 'enemy';
  size: number;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  cost: number;
  bulletSpeed: number;
  color: string;
  unlocked: boolean;
}

export interface GameStats {
  wins: number;
  losses: number;
  totalKills: number;
  totalShots: number;
  accuracy: number;
  coins: number;
}

export interface Level {
  id: number;
  enemyCount: number;
  enemySpeed: number;
  baseHealth: number;
  reward: number;
}
