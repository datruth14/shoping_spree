'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { EventBus } from '@/phaser/EventBus';
import { CONSTANTS } from '@/phaser/constants';
import { getStoredMoves, addPoints, getStoredTime } from '@/lib/storage'; // Import storage
import styles from './GameCanvas.module.css';

export default function GameCanvas() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'weekly';
    const isDaily = mode === 'daily';

    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(CONSTANTS.MOVES_LIMIT);
    // Daily starts at 60, Weekly starts at 300
    const [timeLeft, setTimeLeft] = useState(isDaily ? 60 : 300);
    const [gameOver, setGameOver] = useState(false);

    // Track saved points to prevent double counting
    const lastSavedScore = useRef(0);
    // Track initializing state to prevent race conditions
    const isInitializing = useRef(false);

    // Apply Persistent Time Upgrade on Mount
    useEffect(() => {
        const extra = getStoredTime();
        if (extra > 0) {
            setTimeLeft(curr => curr + extra);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0 && !gameRef.current && !isInitializing.current) {
                initGame();
            }
        });

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0) {
            setGameOver(true);
            return;
        }

        if (gameOver) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameOver]);

    const initGame = async () => {
        if (gameRef.current || isInitializing.current) return;
        isInitializing.current = true;

        try {
            const Phaser = (await import('phaser')).default;
            const { GameScene } = await import('@/phaser/GameScene');

            if (!containerRef.current) return;

            // Get persistent extra moves
            const extraMoves = getStoredMoves();

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                parent: containerRef.current,
                width: '100%',
                height: '100%',
                transparent: true,
                scene: [GameScene],
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.NO_CENTER
                }
            };

            const game = new Phaser.Game(config);
            gameRef.current = game;

            // Pass extra moves to registry so Scene can read it
            game.registry.set('initExtraMoves', extraMoves);

            // Listen for events
            EventBus.on('score-update', (points: number) => {
                const currentScore = points;
                const delta = currentScore - lastSavedScore.current;
                if (delta > 0) {
                    addPoints(delta);
                    lastSavedScore.current = currentScore;
                }
                setScore(points);
            });

            EventBus.on('moves-update', (remaining: number) => {
                setMoves(remaining);
                if (remaining <= 0) {
                    setGameOver(true);
                }
            });

            EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
                // Scene is ready
            });
        } finally {
            isInitializing.current = false;
        }
    };

    const handleRestart = () => {
        if (gameRef.current) {
            const scene = gameRef.current.scene.getScene('GameScene');
            if (scene) {
                scene.scene.restart();
                setScore(0);
                lastSavedScore.current = 0; // Reset tracking

                // On restart, apply persistent upgrades again
                const extraMoves = getStoredMoves();
                gameRef.current.registry.set('initExtraMoves', extraMoves);

                setMoves(CONSTANTS.MOVES_LIMIT + extraMoves);

                // Reset time with persistent upgrade
                const extraTime = getStoredTime();
                setTimeLeft((isDaily ? 60 : 300) + extraTime);

                setGameOver(false);
            }
        }
    };


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.uiOverlay}>
                <div className={styles.statBox}>
                    <span className={styles.label}>POINTS</span>
                    <span className={styles.value}>{score}</span>
                </div>

                <div className={styles.timerBox}>
                    <span className={styles.label}>TIME LEFT</span>
                    <span className={`${styles.timerValue} ${timeLeft < 30 ? styles.lowTime : ''}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <div className={styles.statBox}>
                    <span className={styles.label}>MOVES</span>
                    <span className={styles.value}>{moves}</span>
                </div>
            </div>

            <div className={styles.canvasContainer}>
                <div ref={containerRef} className={styles.canvasWrapper} />
                {gameOver && (
                    <div className={styles.gameOverOverlay}>
                        <h1>GAME OVER</h1>
                        <p>Time's Up!</p>
                        <p>Final Points: {score}</p>
                        <button onClick={handleRestart} className={styles.restartBtn}>
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.controls}>
                {!gameOver && (
                    <button onClick={() => router.push('/')} className={styles.restartBtn}>
                        Back
                    </button>
                )}
            </div>
        </div>
    );
}
