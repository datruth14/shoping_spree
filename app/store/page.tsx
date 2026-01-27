'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './store.module.css';
import { getWallet, spendPoints, addMoves, addTime, getStoredMoves, getStoredTime } from '@/lib/storage';
import { CONSTANTS } from '@/phaser/constants';

export default function StorePage() {
    const [points, setPoints] = useState(0);
    const [extraMoves, setExtraMoves] = useState(0);
    const [extraTime, setExtraTime] = useState(0);
    const [message, setMessage] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [activeTab, setActiveTab] = useState<'wallet' | 'timer' | 'convert'>('wallet');

    useEffect(() => {
        const wallet = getWallet();
        setPoints(wallet.points);
        setExtraMoves(getStoredMoves());
        setExtraTime(getStoredTime());
    }, []);

    const handleBuy = (cost: number, moves: number) => {
        if (spendPoints(cost)) {
            addMoves(moves);
            setPoints(prev => prev - cost);
            setExtraMoves(prev => prev + moves);
            setMessage(`Successfully purchased ${moves} moves!`);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('Not enough points!');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleBuyTime = (cost: number, seconds: number) => {
        if (spendPoints(cost)) {
            addTime(seconds);
            setPoints(prev => prev - cost);
            setExtraTime(prev => prev + seconds);
            setMessage(`Successfully purchased ${seconds} seconds extra!`);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('Not enough points!');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleConvert = () => {
        const cost = 1000000;
        if (spendPoints(cost)) {
            setPoints(prev => prev - cost);
            const code = 'PZ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            setCouponCode(code);
            setMessage('Conversion Successful!');
        } else {
            setMessage('Not enough points!');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (secs === 0) return `${mins}m`;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Store</h1>

            {/* Stats Row */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.balanceLabel}>Points</span>
                    <span className={styles.balanceAmount}>{points}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.balanceLabel}>Start Moves</span>
                    <span className={styles.balanceAmount}>{CONSTANTS.MOVES_LIMIT + extraMoves}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.balanceLabel}>Start Time</span>
                    <div className={styles.timeStatBox}>
                        <div>Daily: {formatTime(60 + extraTime)}</div>
                        <div>Weekly: {formatTime(300 + extraTime)}</div>
                    </div>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'wallet' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('wallet')}
                >
                    Moves Wallet
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'timer' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('timer')}
                >
                    Time Extension
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'convert' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('convert')}
                >
                    Convert Points
                </button>
            </div>

            {activeTab === 'wallet' && (
                <div className={styles.productsGrid}>
                    <div className={styles.productCard}>
                        <div className={styles.productName}>+5 Moves</div>
                        <div className={styles.productCost}>500 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuy(500, 5)}
                            disabled={points < 500}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+10 Moves</div>
                        <div className={styles.productCost}>900 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuy(900, 10)}
                            disabled={points < 900}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+20 Moves</div>
                        <div className={styles.productCost}>1600 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuy(1600, 20)}
                            disabled={points < 1600}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+50 Moves</div>
                        <div className={styles.productCost}>3500 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuy(3500, 50)}
                            disabled={points < 3500}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+100 Moves</div>
                        <div className={styles.productCost}>6000 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuy(6000, 100)}
                            disabled={points < 6000}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+200 Moves</div>
                        <div className={styles.productCost}>11000 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuy(11000, 200)}
                            disabled={points < 11000}
                        >
                            Purchase
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'timer' && (
                <div className={styles.productsGrid}>
                    <div className={styles.productCard}>
                        <div className={styles.productName}>+60 Seconds</div>
                        <div className={styles.productCost}>1000 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuyTime(1000, 60)}
                            disabled={points < 1000}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+3 Minutes</div>
                        <div className={styles.productCost}>2500 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuyTime(2500, 180)}
                            disabled={points < 2500}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+5 Minutes</div>
                        <div className={styles.productCost}>4000 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuyTime(4000, 300)}
                            disabled={points < 4000}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+10 Minutes</div>
                        <div className={styles.productCost}>7500 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuyTime(7500, 600)}
                            disabled={points < 7500}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+30 Minutes</div>
                        <div className={styles.productCost}>20000 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuyTime(20000, 1800)}
                            disabled={points < 20000}
                        >
                            Purchase
                        </button>
                    </div>

                    <div className={styles.productCard}>
                        <div className={styles.productName}>+60 Minutes</div>
                        <div className={styles.productCost}>35000 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={() => handleBuyTime(35000, 3600)}
                            disabled={points < 35000}
                        >
                            Purchase
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'convert' && (
                <div className={styles.productsGrid}>
                    <div className={`${styles.productCard} ${styles.couponCard}`}>
                        <div className={styles.productName}>5,000 Naira Coupon</div>
                        <div className={styles.productCost}>1,000,000 PTS</div>
                        <button
                            className={styles.buyButton}
                            onClick={handleConvert}
                            disabled={points < 1000000}
                        >
                            Convert
                        </button>
                    </div>
                </div>
            )}

            {couponCode && (
                <div className={styles.couponResult}>
                    <h3>Your Coupon Code:</h3>
                    <div className={styles.codeDisplay}>{couponCode}</div>
                    <p>Screenshot or save this code!</p>
                </div>
            )}

            <div className={styles.successMsg}>{message}</div>

            <Link href="/" className={styles.backButton}>
                Back to Home
            </Link>
        </div>
    );
}
