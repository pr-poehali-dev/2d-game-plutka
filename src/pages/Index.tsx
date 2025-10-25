import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameCanvas } from '@/components/GameCanvas';
import { AuthScreen } from '@/components/AuthScreen';
import { AdminPanel } from '@/components/AdminPanel';
import { weapons } from '@/data/weapons';
import { levels } from '@/data/levels';
import { achievements } from '@/data/achievements';
import { Weapon } from '@/types/game';
import { User } from '@/types/user';
import Icon from '@/components/ui/icon';
import { userManager } from '@/utils/userManager';

type Screen = 'menu' | 'game' | 'profile' | 'shop' | 'multi' | 'achievements';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(userManager.getCurrentUser());
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameMode, setGameMode] = useState<'single' | 'multi'>('single');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const selectedWeapon = useMemo(
    () => weapons.find((w) => w.id === currentUser?.selectedWeaponId) || weapons[0],
    [currentUser]
  );

  const unlockedAchievements = useMemo(() => {
    if (!currentUser) return [];
    return achievements.filter((a) => 
      a.requirement(currentUser) && !currentUser.achievements.includes(a.id)
    );
  }, [currentUser]);

  useEffect(() => {
    if (unlockedAchievements.length > 0 && currentUser) {
      const newAchievements = unlockedAchievements.map((a) => a.id);
      const totalReward = unlockedAchievements.reduce((sum, a) => sum + a.reward, 0);

      const updated: User = {
        ...currentUser,
        achievements: [...currentUser.achievements, ...newAchievements],
        stats: {
          ...currentUser.stats,
          coins: currentUser.stats.coins + totalReward,
        },
      };

      userManager.updateUser(currentUser.id, updated);
      setCurrentUser(updated);
    }
  }, [unlockedAchievements, currentUser]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    userManager.logout();
    setCurrentUser(null);
  };

  const handleGameEnd = (won: boolean, kills: number, shots: number) => {
    if (!currentUser) return;

    const levelData = levels.find((l) => l.id === currentUser.currentLevel);

    const updated: User = {
      ...currentUser,
      stats: {
        wins: won ? currentUser.stats.wins + 1 : currentUser.stats.wins,
        losses: won ? currentUser.stats.losses : currentUser.stats.losses + 1,
        totalKills: currentUser.stats.totalKills + kills,
        totalShots: currentUser.stats.totalShots + shots,
        accuracy:
          currentUser.stats.totalShots + shots > 0
            ? ((currentUser.stats.totalKills + kills) / (currentUser.stats.totalShots + shots)) * 100
            : 0,
        coins: won ? currentUser.stats.coins + (levelData?.reward || 0) : currentUser.stats.coins,
      },
      currentLevel: won && currentUser.currentLevel < levels.length 
        ? currentUser.currentLevel + 1 
        : currentUser.currentLevel,
    };

    userManager.updateUser(currentUser.id, updated);
    setCurrentUser(updated);
    setScreen('menu');
  };

  const buyWeapon = (weapon: Weapon) => {
    if (!currentUser) return;
    if (currentUser.stats.coins >= weapon.cost && !currentUser.unlockedWeapons.includes(weapon.id)) {
      const updated: User = {
        ...currentUser,
        stats: {
          ...currentUser.stats,
          coins: currentUser.stats.coins - weapon.cost,
        },
        unlockedWeapons: [...currentUser.unlockedWeapons, weapon.id],
      };

      userManager.updateUser(currentUser.id, updated);
      setCurrentUser(updated);
    }
  };

  const selectWeapon = (weaponId: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      selectedWeaponId: weaponId,
    };
    userManager.updateUser(currentUser.id, updated);
    setCurrentUser(updated);
  };

  const handleAdminLogin = () => {
    if (adminLogin === 'plutka' && adminPassword === 'user') {
      setAdminAuth(true);
      setShowAdmin(false);
      setAdminLogin('');
      setAdminPassword('');
    } else {
      alert('Неверный логин или пароль');
    }
  };

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const renderMenu = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#0A0E27]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(155,135,245,0.1),transparent_50%)]" />
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              opacity: Math.random(),
            }}
          />
        ))}
      </div>

      <Button
        onClick={() => setShowAdmin(true)}
        variant="ghost"
        className="absolute top-4 right-4 text-gray-600 hover:text-cyan-400"
        size="sm"
      >
        <Icon name="Settings" size={16} />
      </Button>

      <div className="relative z-10 text-center space-y-6 md:space-y-8 max-w-2xl w-full px-4">
        <h1 className="text-5xl md:text-8xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 animate-fade-in font-orbitron">
          2DPlutka
        </h1>

        <p className="text-cyan-300 text-lg md:text-xl font-orbitron">
          Привет, {currentUser.username}!
        </p>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-8 md:mt-12">
          <Button
            onClick={() => {
              setGameMode('single');
              setScreen('game');
            }}
            className="h-12 md:h-16 text-sm md:text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(0,217,255,0.5)] font-orbitron"
          >
            <Icon name="Zap" className="mr-1 md:mr-2" size={18} />
            <span className="hidden md:inline">Кампания</span>
            <span className="md:hidden">Игра</span>
          </Button>

          <Button
            onClick={() => {
              setGameMode('multi');
              setScreen('multi');
            }}
            className="h-12 md:h-16 text-sm md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_20px_rgba(155,135,245,0.5)] font-orbitron"
          >
            <Icon name="Users" className="mr-1 md:mr-2" size={18} />
            Мультиплеер
          </Button>

          <Button
            onClick={() => setScreen('profile')}
            className="h-12 md:h-16 text-sm md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-orbitron"
          >
            <Icon name="User" className="mr-1 md:mr-2" size={18} />
            Профиль
          </Button>

          <Button
            onClick={() => setScreen('shop')}
            className="h-12 md:h-16 text-sm md:text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 font-orbitron"
          >
            <Icon name="ShoppingCart" className="mr-1 md:mr-2" size={18} />
            Арсенал
          </Button>

          <Button
            onClick={() => setScreen('achievements')}
            className="h-12 md:h-16 text-sm md:text-lg font-bold bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 font-orbitron col-span-2"
          >
            <Icon name="Award" className="mr-1 md:mr-2" size={18} />
            Достижения
          </Button>
        </div>

        <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Trophy" className="text-yellow-500" />
              <span className="font-bold font-orbitron">Уровень {currentUser.currentLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Coins" className="text-yellow-500" />
              <span className="font-bold font-orbitron">{currentUser.stats.coins}</span>
            </div>
          </div>
        </div>

        <Button onClick={handleLogout} variant="ghost" className="text-red-400 hover:text-red-300">
          <Icon name="LogOut" className="mr-2" />
          Выйти
        </Button>
      </div>

      <Dialog open={showAdmin} onOpenChange={setShowAdmin}>
        <DialogContent className="bg-slate-900 border-2 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 font-orbitron">Вход в админ-панель</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Логин"
              value={adminLogin}
              onChange={(e) => setAdminLogin(e.target.value)}
              className="bg-slate-800 border-cyan-500/30 text-white"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="bg-slate-800 border-cyan-500/30 text-white"
            />
            <Button onClick={handleAdminLogin} className="w-full bg-cyan-600 hover:bg-cyan-500">
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {adminAuth && (
        <AdminPanel
          isOpen={adminAuth}
          onClose={() => setAdminAuth(false)}
          currentUser={currentUser}
          onUserUpdate={setCurrentUser}
        />
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );

  const renderGame = () => {
    const levelData = levels.find((l) => l.id === currentUser.currentLevel) || levels[0];

    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center gap-4 md:gap-6 bg-[#0A0E27]">
        <div className="flex items-center justify-between w-full max-w-4xl">
          <Button
            onClick={() => setScreen('menu')}
            variant="outline"
            className="border-cyan-500 text-cyan-500 font-orbitron"
          >
            <Icon name="ArrowLeft" className="mr-2" />
            Выход
          </Button>

          <div className="flex gap-6 items-center">
            <Badge className="text-lg px-4 py-2 bg-cyan-600 font-orbitron">
              Уровень {currentUser.currentLevel}
            </Badge>
            <Badge className="text-lg px-4 py-2 bg-purple-600 font-orbitron hidden md:block">
              {selectedWeapon.name}
            </Badge>
          </div>
        </div>

        <GameCanvas
          level={levelData}
          weapon={selectedWeapon}
          onGameEnd={handleGameEnd}
          mode={gameMode}
        />

        <div className="grid grid-cols-3 gap-2 md:gap-4 w-full max-w-4xl">
          <Card className="p-2 md:p-4 bg-slate-900/80 border-cyan-500/30">
            <div className="flex items-center gap-1 md:gap-2">
              <Icon name="Target" className="text-cyan-500" size={16} />
              <div>
                <div className="text-xs md:text-sm text-gray-400">Враги</div>
                <div className="text-lg md:text-xl font-bold font-orbitron">{levelData.enemyCount}</div>
              </div>
            </div>
          </Card>

          <Card className="p-2 md:p-4 bg-slate-900/80 border-purple-500/30">
            <div className="flex items-center gap-1 md:gap-2">
              <Icon name="Zap" className="text-purple-500" size={16} />
              <div>
                <div className="text-xs md:text-sm text-gray-400">Скорострельность</div>
                <div className="text-lg md:text-xl font-bold font-orbitron">{selectedWeapon.fireRate}ms</div>
              </div>
            </div>
          </Card>

          <Card className="p-2 md:p-4 bg-slate-900/80 border-pink-500/30">
            <div className="flex items-center gap-1 md:gap-2">
              <Icon name="Sword" className="text-pink-500" size={16} />
              <div>
                <div className="text-xs md:text-sm text-gray-400">Урон</div>
                <div className="text-lg md:text-xl font-bold font-orbitron">{selectedWeapon.damage}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="min-h-screen p-4 md:p-8 bg-[#0A0E27]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-cyan-400 font-orbitron">Боевой профиль</h1>
          <Button onClick={() => setScreen('menu')} variant="outline" className="border-cyan-500 text-cyan-500">
            <Icon name="ArrowLeft" className="mr-2" />
            Назад
          </Button>
        </div>

        <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Icon name="Trophy" className="mx-auto text-yellow-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-green-500 font-orbitron">{currentUser.stats.wins}</div>
              <div className="text-gray-400">Побед</div>
            </div>

            <div className="text-center">
              <Icon name="X" className="mx-auto text-red-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-red-500 font-orbitron">{currentUser.stats.losses}</div>
              <div className="text-gray-400">Поражений</div>
            </div>

            <div className="text-center">
              <Icon name="Crosshair" className="mx-auto text-purple-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-purple-500 font-orbitron">{currentUser.stats.totalKills}</div>
              <div className="text-gray-400">Убийств</div>
            </div>

            <div className="text-center">
              <Icon name="Target" className="mx-auto text-cyan-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-cyan-500 font-orbitron">
                {currentUser.stats.accuracy.toFixed(1)}%
              </div>
              <div className="text-gray-400">Точность</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Процент побед</span>
              <span className="font-bold font-orbitron">
                {currentUser.stats.wins + currentUser.stats.losses > 0
                  ? ((currentUser.stats.wins / (currentUser.stats.wins + currentUser.stats.losses)) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                currentUser.stats.wins + currentUser.stats.losses > 0
                  ? (currentUser.stats.wins / (currentUser.stats.wins + currentUser.stats.losses)) * 100
                  : 0
              }
              className="h-3"
            />
          </div>

          <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-yellow-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon name="Coins" className="text-yellow-500" size={40} />
                <div>
                  <div className="text-sm text-gray-400">Всего кредитов</div>
                  <div className="text-3xl font-bold text-yellow-500 font-orbitron">{currentUser.stats.coins}</div>
                </div>
              </div>
              <Button onClick={() => setScreen('shop')} className="bg-gradient-to-r from-yellow-600 to-orange-600">
                <Icon name="ShoppingCart" className="mr-2" />
                Магазин оружия
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="min-h-screen p-4 md:p-8 bg-[#0A0E27]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 font-orbitron">Арсенал оружия</h1>
            <div className="flex items-center gap-2 mt-2">
              <Icon name="Coins" className="text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500 font-orbitron">{currentUser.stats.coins}</span>
            </div>
          </div>
          <Button onClick={() => setScreen('menu')} variant="outline" className="border-cyan-500 text-cyan-500">
            <Icon name="ArrowLeft" className="mr-2" />
            Назад
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weapons.map((weapon) => {
            const isUnlocked = currentUser.unlockedWeapons.includes(weapon.id);
            const canBuy = currentUser.stats.coins >= weapon.cost;

            return (
              <Card
                key={weapon.id}
                className={`p-6 bg-slate-900/80 border-2 transition-all ${
                  isUnlocked ? 'border-green-500/50' : canBuy ? 'border-cyan-500/30 hover:border-cyan-500' : 'border-gray-700/30 opacity-60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-orbitron">{weapon.name}</h3>
                      {isUnlocked && (
                        <Badge className="mt-1 bg-green-600">
                          <Icon name="Check" className="mr-1" size={14} />
                          Открыто
                        </Badge>
                      )}
                    </div>
                    <div
                      className="w-12 h-12 rounded-full"
                      style={{
                        backgroundColor: weapon.color,
                        boxShadow: `0 0 20px ${weapon.color}`,
                      }}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Урон</span>
                      <span className="font-bold text-red-500">{weapon.damage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Скорость стрельбы</span>
                      <span className="font-bold text-purple-500">{weapon.fireRate}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Скорость пуль</span>
                      <span className="font-bold text-cyan-500">{weapon.bulletSpeed}</span>
                    </div>
                  </div>

                  {!isUnlocked && (
                    <Button
                      onClick={() => buyWeapon(weapon)}
                      disabled={!canBuy}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 disabled:opacity-50"
                    >
                      <Icon name="ShoppingCart" className="mr-2" />
                      {weapon.cost} Кредитов
                    </Button>
                  )}

                  {isUnlocked && (
                    <Button
                      onClick={() => {
                        selectWeapon(weapon.id);
                        setScreen('menu');
                      }}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                      variant={selectedWeapon.id === weapon.id ? 'default' : 'outline'}
                    >
                      {selectedWeapon.id === weapon.id ? (
                        <>
                          <Icon name="Check" className="mr-2" />
                          Выбрано
                        </>
                      ) : (
                        <>
                          <Icon name="Zap" className="mr-2" />
                          Выбрать
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="min-h-screen p-4 md:p-8 bg-[#0A0E27]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-cyan-400 font-orbitron">Достижения</h1>
          <Button onClick={() => setScreen('menu')} variant="outline" className="border-cyan-500 text-cyan-500">
            <Icon name="ArrowLeft" className="mr-2" />
            Назад
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const isUnlocked = currentUser.achievements.includes(achievement.id);
            const meetsRequirement = achievement.requirement(currentUser);

            return (
              <Card
                key={achievement.id}
                className={`p-6 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-2 border-yellow-500'
                    : meetsRequirement
                    ? 'bg-green-900/30 border-2 border-green-500 animate-pulse'
                    : 'bg-slate-900/50 border border-gray-700 opacity-60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-full ${
                        isUnlocked ? 'bg-yellow-600' : meetsRequirement ? 'bg-green-600' : 'bg-gray-700'
                      }`}
                    >
                      <Icon name={achievement.icon as any} className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg font-orbitron">{achievement.title}</h3>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Icon name="Coins" size={16} />
                      <span className="font-bold">+{achievement.reward}</span>
                    </div>
                    {isUnlocked && <Badge className="bg-green-600">Получено</Badge>}
                    {!isUnlocked && meetsRequirement && <Badge className="bg-blue-600 animate-pulse">Новое!</Badge>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderMultiplayer = () => (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-[#0A0E27]">
      <Card className="p-6 md:p-12 max-w-2xl w-full bg-slate-900/80 border-2 border-purple-500/30">
        <div className="text-center space-y-6">
          <Icon name="Wifi" className="mx-auto text-purple-500" size={64} />
          <h2 className="text-3xl font-bold text-purple-400 font-orbitron">Мультиплеер арена</h2>
          <p className="text-gray-400 text-lg">
            Бросьте вызов другим пилотам в PvP-битвах в реальном времени!
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button onClick={() => setScreen('game')} className="h-16 bg-gradient-to-r from-purple-600 to-pink-600 font-orbitron">
              <Icon name="Swords" className="mr-2" />
              Быстрая игра
            </Button>
            <Button variant="outline" className="h-16 border-purple-500 text-purple-500 font-orbitron">
              <Icon name="Users" className="mr-2" />
              Создать комнату
            </Button>
          </div>

          <Button onClick={() => setScreen('menu')} variant="ghost" className="mt-6">
            <Icon name="ArrowLeft" className="mr-2" />
            Назад в меню
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {screen === 'menu' && renderMenu()}
      {screen === 'game' && renderGame()}
      {screen === 'profile' && renderProfile()}
      {screen === 'shop' && renderShop()}
      {screen === 'achievements' && renderAchievements()}
      {screen === 'multi' && renderMultiplayer()}
    </div>
  );
};

export default Index;
