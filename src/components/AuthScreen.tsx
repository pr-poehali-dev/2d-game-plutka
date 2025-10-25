import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { userManager } from '@/utils/userManager';
import { User } from '@/types/user';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }

    if (username.length < 3) {
      setError('Имя пользователя должно быть минимум 3 символа');
      return;
    }

    if (password.length < 4) {
      setError('Пароль должен быть минимум 4 символа');
      return;
    }

    const result = mode === 'login' 
      ? userManager.login(username, password)
      : userManager.register(username, password);

    if (result.success && result.user) {
      onAuthSuccess(result.user);
    } else {
      setError(result.error || 'Произошла ошибка');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0E27] relative overflow-hidden">
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

      <Card className="w-full max-w-md p-8 bg-slate-900/90 border-2 border-cyan-500/30 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 font-orbitron mb-2">
            2DPlutka
          </h1>
          <p className="text-gray-400">Cosmic Battle Arena</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-cyan-400">
              Имя пользователя
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-800 border-cyan-500/30 text-white"
              placeholder="Введите имя"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-cyan-400">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-cyan-500/30 text-white"
              placeholder="Введите пароль"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-orbitron"
          >
            <Icon name={mode === 'login' ? 'LogIn' : 'UserPlus'} className="mr-2" />
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-cyan-400 hover:text-cyan-300"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {mode === 'login' 
              ? 'Нет аккаунта? Зарегистрируйтесь' 
              : 'Уже есть аккаунт? Войдите'}
          </Button>
        </form>
      </Card>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
