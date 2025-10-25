import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { userManager } from '@/utils/userManager';
import { User } from '@/types/user';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserUpdate: (user: User) => void;
}

export const AdminPanel = ({ isOpen, onClose, currentUser, onUserUpdate }: AdminPanelProps) => {
  const [users, setUsers] = useState(userManager.getAllUsers());
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [coins, setCoins] = useState('0');

  const refreshUsers = () => {
    setUsers(userManager.getAllUsers());
  };

  const handleAddCoins = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const amount = parseInt(coins);
    if (isNaN(amount)) return;

    const updated = {
      ...user,
      stats: {
        ...user.stats,
        coins: user.stats.coins + amount,
      },
    };

    userManager.updateUser(userId, updated);
    
    if (userId === currentUser.id) {
      onUserUpdate(updated);
    }
    
    refreshUsers();
    setCoins('0');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert('Нельзя удалить текущего пользователя');
      return;
    }

    if (confirm('Удалить пользователя?')) {
      userManager.deleteUser(userId);
      refreshUsers();
    }
  };

  const handleResetProgress = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (confirm('Сбросить прогресс пользователя?')) {
      const updated = {
        ...user,
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

      userManager.updateUser(userId, updated);
      
      if (userId === currentUser.id) {
        onUserUpdate(updated);
      }
      
      refreshUsers();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 font-orbitron">
            Админ-панель
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="p-4 bg-slate-800/50 border-cyan-500/20">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="User" className="text-cyan-500" size={20} />
                      <span className="font-bold text-white font-orbitron">
                        {user.username}
                      </span>
                      {user.id === currentUser.id && (
                        <span className="text-xs bg-green-600 px-2 py-1 rounded">ВЫ</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Побед:</span>
                        <span className="ml-2 text-green-500">{user.stats.wins}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Поражений:</span>
                        <span className="ml-2 text-red-500">{user.stats.losses}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Уровень:</span>
                        <span className="ml-2 text-purple-500">{user.currentLevel}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Монет:</span>
                        <span className="ml-2 text-yellow-500">{user.stats.coins}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Монет"
                        value={coins}
                        onChange={(e) => setCoins(e.target.value)}
                        className="w-24 bg-slate-700 border-cyan-500/30 text-white"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddCoins(user.id)}
                        className="bg-yellow-600 hover:bg-yellow-500"
                      >
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetProgress(user.id)}
                        className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-500/10"
                      >
                        <Icon name="RotateCcw" className="mr-1" size={16} />
                        Сброс
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                        disabled={user.id === currentUser.id}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Нет зарегистрированных пользователей
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
