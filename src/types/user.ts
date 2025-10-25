export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: number;
  stats: {
    wins: number;
    losses: number;
    totalKills: number;
    totalShots: number;
    accuracy: number;
    coins: number;
  };
  currentLevel: number;
  unlockedWeapons: string[];
  selectedWeaponId: string;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (user: User) => boolean;
  reward: number;
}
