
import GameCanvas from '@/components/GameCanvas';

export const metadata = {
    title: 'Shopping Spree',
    description: 'A Match-3 implementation with Next.js and Phaser',
};

export default function GamePage() {
    return (
        <main>
            <GameCanvas />
        </main>
    );
}
