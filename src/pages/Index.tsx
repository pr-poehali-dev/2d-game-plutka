import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameCanvas } from '@/components/GameCanvas';
import { weapons } from '@/data/weapons';
import { levels } from '@/data/levels';
import { GameStats, Weapon } from '@/types/game';
import Icon from '@/components/ui/icon';

type Screen = 'menu' | 'game' | 'profile' | 'shop' | 'multi';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(weapons[0]);
  const [gameMode, setGameMode] = useState<'single' | 'multi'>('single');
  const [stats, setStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    totalKills: 0,
    totalShots: 0,
    accuracy: 0,
    coins: 500,
  });

  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(['basic']);

  const handleGameEnd = (won: boolean, kills: number, shots: number) => {
    const levelData = levels.find((l) => l.id === currentLevel);

    setStats((prev) => ({
      wins: won ? prev.wins + 1 : prev.wins,
      losses: won ? prev.losses : prev.losses + 1,
      totalKills: prev.totalKills + kills,
      totalShots: prev.totalShots + shots,
      accuracy: prev.totalShots + shots > 0 
        ? ((prev.totalKills + kills) / (prev.totalShots + shots)) * 100 
        : 0,
      coins: won ? prev.coins + (levelData?.reward || 0) : prev.coins,
    }));

    if (won && currentLevel < levels.length) {
      setCurrentLevel(currentLevel + 1);
    }

    setScreen('menu');
  };

  const buyWeapon = (weapon: Weapon) => {
    if (stats.coins >= weapon.cost && !unlockedWeapons.includes(weapon.id)) {
      setStats((prev) => ({ ...prev, coins: prev.coins - weapon.cost }));
      setUnlockedWeapons((prev) => [...prev, weapon.id]);
    }
  };

  const renderMenu = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#0A0E27]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(155,135,245,0.1),transparent_50%)]" />
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
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

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <h1 
          className="text-8xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 animate-fade-in font-orbitron"
        >
          2DPlutka
        </h1>
        
        <p className="text-cyan-300 text-xl font-orbitron">
          Cosmic Battle Arena
        </p>

        <div className="grid grid-cols-2 gap-4 mt-12">
          <Button
            onClick={() => {
              setGameMode('single');
              setScreen('game');
            }}
            className="h-16 text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(0,217,255,0.5)] font-orbitron"
          >
            <Icon name="Zap" className="mr-2" />
            Campaign Mode
          </Button>

          <Button
            onClick={() => {
              setGameMode('multi');
              setScreen('multi');
            }}
            className="h-16 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_20px_rgba(155,135,245,0.5)] font-orbitron"
          >
            <Icon name="Users" className="mr-2" />
            Multiplayer
          </Button>

          <Button
            onClick={() => setScreen('profile')}
            className="h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-orbitron"
          >
            <Icon name="User" className="mr-2" />
            Profile
          </Button>

          <Button
            onClick={() => setScreen('shop')}
            className="h-16 text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 font-orbitron"
          >
            <Icon name="ShoppingCart" className="mr-2" />
            Arsenal
          </Button>
        </div>

        <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Trophy" className="text-yellow-500" />
              <span className="font-bold font-orbitron">
                Level {currentLevel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Coins" className="text-yellow-500" />
              <span className="font-bold font-orbitron">
                {stats.coins}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );

  const renderGame = () => {
    const levelData = levels.find((l) => l.id === currentLevel) || levels[0];

    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-6 bg-[#0A0E27]">
        <div className="flex items-center justify-between w-full max-w-4xl">
          <Button
            onClick={() => setScreen('menu')}
            variant="outline"
            className="border-cyan-500 text-cyan-500 font-orbitron"
          >
            <Icon name="ArrowLeft" className="mr-2" />
            Exit
          </Button>

          <div className="flex gap-6 items-center">
            <Badge className="text-lg px-4 py-2 bg-cyan-600 font-orbitron">
              Level {currentLevel}
            </Badge>
            <Badge className="text-lg px-4 py-2 bg-purple-600 font-orbitron">
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

        <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
          <Card className="p-4 bg-slate-900/80 border-cyan-500/30">
            <div className="flex items-center gap-2">
              <Icon name="Target" className="text-cyan-500" />
              <div>
                <div className="text-sm text-gray-400">Enemies</div>
                <div className="text-xl font-bold font-orbitron">
                  {levelData.enemyCount}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-purple-500/30">
            <div className="flex items-center gap-2">
              <Icon name="Zap" className="text-purple-500" />
              <div>
                <div className="text-sm text-gray-400">Fire Rate</div>
                <div className="text-xl font-bold font-orbitron">
                  {selectedWeapon.fireRate}ms
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-pink-500/30">
            <div className="flex items-center gap-2">
              <Icon name="Sword" className="text-pink-500" />
              <div>
                <div className="text-sm text-gray-400">Damage</div>
                <div className="text-xl font-bold font-orbitron">
                  {selectedWeapon.damage}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="min-h-screen p-8 bg-[#0A0E27]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-cyan-400 font-orbitron">
            Combat Profile
          </h1>
          <Button
            onClick={() => setScreen('menu')}
            variant="outline"
            className="border-cyan-500 text-cyan-500"
          >
            <Icon name="ArrowLeft" className="mr-2" />
            Back
          </Button>
        </div>

        <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Icon name="Trophy" className="mx-auto text-yellow-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-green-500 font-orbitron">
                {stats.wins}
              </div>
              <div className="text-gray-400">Victories</div>
            </div>

            <div className="text-center">
              <Icon name="X" className="mx-auto text-red-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-red-500 font-orbitron">
                {stats.losses}
              </div>
              <div className="text-gray-400">Defeats</div>
            </div>

            <div className="text-center">
              <Icon name="Crosshair" className="mx-auto text-purple-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-purple-500 font-orbitron">
                {stats.totalKills}
              </div>
              <div className="text-gray-400">Total Kills</div>
            </div>

            <div className="text-center">
              <Icon name="Target" className="mx-auto text-cyan-500 mb-2" size={32} />
              <div className="text-3xl font-bold text-cyan-500 font-orbitron">
                {stats.accuracy.toFixed(1)}%
              </div>
              <div className="text-gray-400">Accuracy</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Win Rate</span>
              <span className="font-bold font-orbitron">
                {stats.wins + stats.losses > 0
                  ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <Progress
              value={
                stats.wins + stats.losses > 0
                  ? (stats.wins / (stats.wins + stats.losses)) * 100
                  : 0
              }
              className="h-3"
            />
          </div>

          <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="Coins" className="text-yellow-500" size={40} />
                <div>
                  <div className="text-sm text-gray-400">Total Credits</div>
                  <div className="text-3xl font-bold text-yellow-500 font-orbitron">
                    {stats.coins}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setScreen('shop')}
                className="bg-gradient-to-r from-yellow-600 to-orange-600"
              >
                <Icon name="ShoppingCart" className="mr-2" />
                Visit Arsenal
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="min-h-screen p-8 bg-[#0A0E27]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 font-orbitron">
              Weapon Arsenal
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Icon name="Coins" className="text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500 font-orbitron">
                {stats.coins}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setScreen('menu')}
            variant="outline"
            className="border-cyan-500 text-cyan-500"
          >
            <Icon name="ArrowLeft" className="mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weapons.map((weapon) => {
            const isUnlocked = unlockedWeapons.includes(weapon.id);
            const canBuy = stats.coins >= weapon.cost;

            return (
              <Card
                key={weapon.id}
                className={`p-6 bg-slate-900/80 border-2 transition-all ${
                  isUnlocked
                    ? 'border-green-500/50'
                    : canBuy
                    ? 'border-cyan-500/30 hover:border-cyan-500'
                    : 'border-gray-700/30 opacity-60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-orbitron">
                        {weapon.name}
                      </h3>
                      {isUnlocked && (
                        <Badge className="mt-1 bg-green-600">
                          <Icon name="Check" className="mr-1" size={14} />
                          Unlocked
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
                      <span className="text-gray-400">Damage</span>
                      <span className="font-bold text-red-500">{weapon.damage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fire Rate</span>
                      <span className="font-bold text-purple-500">{weapon.fireRate}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bullet Speed</span>
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
                      {weapon.cost} Credits
                    </Button>
                  )}

                  {isUnlocked && (
                    <Button
                      onClick={() => {
                        setSelectedWeapon(weapon);
                        setScreen('menu');
                      }}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                      variant={selectedWeapon.id === weapon.id ? 'default' : 'outline'}
                    >
                      {selectedWeapon.id === weapon.id ? (
                        <>
                          <Icon name="Check" className="mr-2" />
                          Equipped
                        </>
                      ) : (
                        <>
                          <Icon name="Zap" className="mr-2" />
                          Equip
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

  const renderMultiplayer = () => (
    <div className="min-h-screen p-8 flex items-center justify-center bg-[#0A0E27]">
      <Card className="p-12 max-w-2xl bg-slate-900/80 border-2 border-purple-500/30">
        <div className="text-center space-y-6">
          <Icon name="Wifi" className="mx-auto text-purple-500" size={64} />
          <h2 className="text-3xl font-bold text-purple-400 font-orbitron">
            Multiplayer Arena
          </h2>
          <p className="text-gray-400 text-lg">
            Challenge other pilots in real-time PvP battles. Connect with players worldwide and prove your skills!
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button
              onClick={() => setScreen('game')}
              className="h-16 bg-gradient-to-r from-purple-600 to-pink-600 font-orbitron"
            >
              <Icon name="Swords" className="mr-2" />
              Quick Match
            </Button>
            <Button
              variant="outline"
              className="h-16 border-purple-500 text-purple-500 font-orbitron"
            >
              <Icon name="Users" className="mr-2" />
              Create Room
            </Button>
          </div>

          <Button
            onClick={() => setScreen('menu')}
            variant="ghost"
            className="mt-6"
          >
            <Icon name="ArrowLeft" className="mr-2" />
            Back to Menu
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
      {screen === 'multi' && renderMultiplayer()}
    </div>
  );
};

export default Index;