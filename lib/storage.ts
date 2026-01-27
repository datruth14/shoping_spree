export const STORAGE_KEYS = {
    POINTS: 'pz_points',
    EXTRA_MOVES: 'pz_extra_moves',
    EXTRA_TIME: 'pz_extra_time',
};

export const getWallet = () => {
    if (typeof window === 'undefined') return { points: 0, extraMoves: 0, extraTime: 0 };

    const points = parseInt(localStorage.getItem(STORAGE_KEYS.POINTS) || '0', 10);
    const extraMoves = parseInt(localStorage.getItem(STORAGE_KEYS.EXTRA_MOVES) || '0', 10);
    const extraTime = parseInt(localStorage.getItem(STORAGE_KEYS.EXTRA_TIME) || '0', 10);

    return { points, extraMoves, extraTime };
};

export const addPoints = (amount: number) => {
    const { points } = getWallet();
    const newPoints = points + amount;
    localStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString());
    return newPoints;
};

export const spendPoints = (amount: number) => {
    const { points } = getWallet();
    if (points >= amount) {
        localStorage.setItem(STORAGE_KEYS.POINTS, (points - amount).toString());
        return true;
    }
    return false;
};

export const addMoves = (amount: number) => {
    const { extraMoves } = getWallet();
    localStorage.setItem(STORAGE_KEYS.EXTRA_MOVES, (extraMoves + amount).toString());
};

export const addTime = (seconds: number) => {
    const { extraTime } = getWallet();
    localStorage.setItem(STORAGE_KEYS.EXTRA_TIME, (extraTime + seconds).toString());
};

export const consumeExtraMoves = () => {
    // Legacy support: We might want to rename this, but for now let's just change behavior 
    // or better, export new function and update caller.
    // Actually, to avoid breaking imports immediately, I'll export alias or just change behavior.
    // Plan said Modify Functions.
    return getStoredMoves();
};

export const consumeExtraTime = () => {
    return getStoredTime();
};

export const getStoredMoves = () => {
    const { extraMoves } = getWallet();
    return extraMoves;
};

export const getStoredTime = () => {
    const { extraTime } = getWallet();
    return extraTime;
};
