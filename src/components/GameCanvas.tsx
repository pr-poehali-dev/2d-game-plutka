import { useEffect, useRef, useState } from 'react';
import { Player, Base, Bullet, Weapon } from '@/types/game';
import { Level } from '@/types/game';

interface GameCanvasProps {
  level: Level;
  weapon: Weapon;
  onGameEnd: (won: boolean, kills: number, shots: number) => void;
  mode: 'single' | 'multi';
}

export const GameCanvas = ({ level, weapon, onGameEnd, mode }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsRef = useRef<number>(60);
  const gameStateRef = useRef({
    players: [] as Player[],
    playerBase: null as Base | null,
    enemyBase: null as Base | null,
    bullets: [] as Bullet[],
    lastShot: 0,
    kills: 0,
    shots: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768;
      canvas.width = isMobile ? Math.min(window.innerWidth - 32, 600) : 800;
      canvas.height = isMobile ? Math.min(window.innerHeight - 200, 500) : 600;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const state = gameStateRef.current;

    state.playerBase = {
      id: 'player-base',
      x: 50,
      y: canvas.height / 2,
      health: 500,
      maxHealth: 500,
      team: 'player',
      size: 30,
    };

    const getEnemyBaseX = () => {
      const isMobile = window.innerWidth < 768;
      return isMobile ? canvas.width - 50 : 750;
    };

    state.enemyBase = {
      id: 'enemy-base',
      x: getEnemyBaseX(),
      y: canvas.height / 2,
      health: level.baseHealth,
      maxHealth: level.baseHealth,
      team: 'enemy',
      size: 30,
    };

    for (let i = 0; i < level.enemyCount; i++) {
      state.players.push({
        id: `enemy-${i}`,
        x: canvas.width * 0.6 + Math.random() * (canvas.width * 0.3),
        y: Math.random() * canvas.height,
        health: 30,
        maxHealth: 30,
        team: 'enemy',
        size: 8,
      });
    }

    const playShootSound = () => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    };

    const playExplosionSound = () => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    };

    const handleInteraction = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const now = Date.now();

      if (now - state.lastShot < weapon.fireRate) return;

      const angle = Math.atan2(y - state.playerBase!.y, x - state.playerBase!.x);
      state.bullets.push({
        id: `bullet-${now}`,
        x: state.playerBase!.x,
        y: state.playerBase!.y,
        velocityX: Math.cos(angle) * weapon.bulletSpeed,
        velocityY: Math.sin(angle) * weapon.bulletSpeed,
        damage: weapon.damage,
        team: 'player',
        size: 4,
      });

      playShootSound();
      state.lastShot = now;
      state.shots++;
    };

    const handleClick = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);

    const gameLoop = () => {
      if (!ctx || !canvas || gameOver) return;

      ctx.fillStyle = '#0A0E27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#00D9FF33';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      state.bullets = state.bullets.filter((bullet) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
          return false;
        }

        for (const player of state.players) {
          const dx = bullet.x - player.x;
          const dy = bullet.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < player.size + bullet.size && bullet.team !== player.team) {
            player.health -= bullet.damage;
            if (player.health <= 0) {
              state.kills++;
              playExplosionSound();
            }
            return false;
          }
        }

        if (state.enemyBase && bullet.team === 'player') {
          const dx = bullet.x - state.enemyBase.x;
          const dy = bullet.y - state.enemyBase.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < state.enemyBase.size + bullet.size) {
            state.enemyBase.health -= bullet.damage;
            if (state.enemyBase.health <= 0) {
              playExplosionSound();
            }
            return false;
          }
        }

        if (state.playerBase && bullet.team === 'enemy') {
          const dx = bullet.x - state.playerBase.x;
          const dy = bullet.y - state.playerBase.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < state.playerBase.size + bullet.size) {
            state.playerBase.health -= bullet.damage;
            return false;
          }
        }

        return true;
      });

      state.players = state.players.filter((player) => {
        if (player.health <= 0) return false;

        if (player.team === 'enemy' && state.playerBase) {
          const dx = state.playerBase.x - player.x;
          const dy = state.playerBase.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 50) {
            const angle = Math.atan2(dy, dx);
            player.x += Math.cos(angle) * level.enemySpeed;
            player.y += Math.sin(angle) * level.enemySpeed;
          }

          if (Math.random() < 0.02) {
            const angle = Math.atan2(dy, dx);
            state.bullets.push({
              id: `enemy-bullet-${Date.now()}-${Math.random()}`,
              x: player.x,
              y: player.y,
              velocityX: Math.cos(angle) * 4,
              velocityY: Math.sin(angle) * 4,
              damage: 5,
              team: 'enemy',
              size: 3,
            });
          }
        }

        return true;
      });

      if (state.playerBase) {
        const gradient = ctx.createRadialGradient(
          state.playerBase.x,
          state.playerBase.y,
          0,
          state.playerBase.x,
          state.playerBase.y,
          state.playerBase.size
        );
        gradient.addColorStop(0, '#00D9FF');
        gradient.addColorStop(1, '#0066FF');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(state.playerBase.x, state.playerBase.y, state.playerBase.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00D9FF';
        ctx.fillRect(10, 10, 200, 20);
        ctx.fillStyle = '#00FF88';
        ctx.fillRect(
          10,
          10,
          (state.playerBase.health / state.playerBase.maxHealth) * 200,
          20
        );
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(10, 10, 200, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Orbitron';
        ctx.fillText(`BASE: ${state.playerBase.health}`, 15, 25);
      }

      if (state.enemyBase) {
        const gradient = ctx.createRadialGradient(
          state.enemyBase.x,
          state.enemyBase.y,
          0,
          state.enemyBase.x,
          state.enemyBase.y,
          state.enemyBase.size
        );
        gradient.addColorStop(0, '#FF006E');
        gradient.addColorStop(1, '#AA0044');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(state.enemyBase.x, state.enemyBase.y, state.enemyBase.size, 0, Math.PI * 2);
        ctx.fill();

        const barX = canvas.width - 210;
        ctx.fillStyle = '#FF006E';
        ctx.fillRect(barX, 10, 200, 20);
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(
          barX,
          10,
          (state.enemyBase.health / state.enemyBase.maxHealth) * 200,
          20
        );
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(barX, 10, 200, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Orbitron';
        ctx.fillText(`ENEMY BASE: ${Math.max(0, state.enemyBase.health)}`, barX + 5, 25);
      }

      state.players.forEach((player) => {
        const color = player.team === 'player' ? '#00D9FF' : '#FF006E';
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const barWidth = 30;
        const barHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(player.x - barWidth / 2, player.y - player.size - 10, barWidth, barHeight);
        ctx.fillStyle = player.team === 'player' ? '#00FF88' : '#FF4444';
        ctx.fillRect(
          player.x - barWidth / 2,
          player.y - player.size - 10,
          (player.health / player.maxHealth) * barWidth,
          barHeight
        );
      });

      state.bullets.forEach((bullet) => {
        ctx.fillStyle = weapon.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = weapon.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (state.enemyBase && state.enemyBase.health <= 0) {
        setGameOver(true);
        onGameEnd(true, state.kills, state.shots);
        return;
      }

      if (state.playerBase && state.playerBase.health <= 0) {
        setGameOver(true);
        onGameEnd(false, state.kills, state.shots);
        return;
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [level, weapon, onGameEnd, gameOver]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="border-2 border-cyan-500 rounded-lg shadow-[0_0_30px_rgba(0,217,255,0.5)]"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
};