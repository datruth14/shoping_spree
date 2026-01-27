import { Suspense } from 'react';
import GameCanvas from '@/components/GameCanvas';

export const metadata = {
    title: 'Shopping Spree',
    description: 'A Match-3 implementation with Next.js and Phaser',
};

function GameLoading() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #2c3e50, #000)',
            color: 'white',
            fontSize: '1.5rem'
        }}>
            Loading Game...
        </div>
    );
}

export default function GamePage() {
    return (
        <main>
            <Suspense fallback={<GameLoading />}>
                <GameCanvas />
            </Suspense>
        </main>
    );
}
