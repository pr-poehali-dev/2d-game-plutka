import { User } from '@/types/user';

const USERS_KEY = '2dplutka_users';
const CURRENT_USER_KEY = '2dplutka_current_user';

export const userManager = {
  getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  getCurrentUser(): User | null {
    try {
      const userId = localStorage.getItem(CURRENT_USER_KEY);
      if (!userId) return null;
      const users = this.getAllUsers();
      return users.find((u) => u.id === userId) || null;
    } catch {
      return null;
    }
  },

  setCurrentUser(userId: string | null): void {
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  register(username: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = this.getAllUsers();
    
    if (users.some((u) => u.username === username)) {
      return { success: false, error: 'Пользователь с таким именем уже существует' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      createdAt: Date.now(),
      stats: {
        wins: 0,
        losses: 0,
        totalKills: 0,
        totalShots: 0,
        accuracy: 0,
        coins: 500,
      },
      currentLevel: 1,
      unlockedWeapons: ['basic'],
      selectedWeaponId: 'basic',
      achievements: [],
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser.id);

    return { success: true, user: newUser };
  },

  login(username: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = this.getAllUsers();
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
      return { success: false, error: 'Неверное имя пользователя или пароль' };
    }

    this.setCurrentUser(user.id);
    return { success: true, user };
  },

  logout(): void {
    this.setCurrentUser(null);
  },

  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
    }
  },

  deleteUser(userId: string): void {
    const users = this.getAllUsers();
    const filtered = users.filter((u) => u.id !== userId);
    this.saveUsers(filtered);
  },
};
