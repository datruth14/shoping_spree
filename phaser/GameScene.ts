import { Scene, GameObjects, Tweens } from 'phaser';
import { CONSTANTS, CANDY_COLORS } from './constants';
import { EventBus } from './EventBus';

import { SoundManager } from './SoundManager';

export class GameScene extends Scene {
    private grid: (GameObjects.Sprite | null)[][] = [];
    private selectedCandy: GameObjects.Sprite | null = null;
    private isProcessing: boolean = false;
    private score: number = 0;
    private moves: number = CONSTANTS.MOVES_LIMIT;
    private gameWidth: number = 0;
    private gameHeight: number = 0;
    private startX: number = 0;
    private startY: number = 0;
    private soundManager: SoundManager;
    private particleEmitter!: GameObjects.Particles.ParticleEmitter;
    private rows: number = CONSTANTS.GRID_ROWS;

    constructor() {
        super('GameScene');
        this.soundManager = new SoundManager();
    }

    preload() {
        // Generate textures programmatically since we don't have assets yet
        this.generateTextures();
    }

    create() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        if (this.gameWidth === 0 || this.gameHeight === 0) return;

        // Check for extra moves from store
        const extraMoves = this.registry.get('initExtraMoves') || 0;
        this.moves = CONSTANTS.MOVES_LIMIT + extraMoves;
        EventBus.emit('moves-update', this.moves);

        // Determine rows based on aspect ratio/device type
        // If landscape (desktop/tablet), reduce rows to fit screen better
        // Mobile is usually portrait, so we leverage more vertical space
        if (this.gameWidth > 768) { // Simple desktop/tablet breakpoint
            this.rows = 6;
        } else {
            this.rows = CONSTANTS.GRID_ROWS; // Default 8
        }

        // Generate textures if not already present
        if (!this.textures.exists('candy_0')) {
            this.generateTextures();
        }

        this.updateBoardPosition();

        // Initialize Particle Emitter
        this.particleEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            emitting: false
        });

        // Center the board
        this.createBoard();
        this.input.on('gameobjectdown', this.onCandyClicked, this);

        // Handle Resize
        this.scale.on('resize', this.resize, this);

        // Initial adjustment
        this.adjustCamera();

        // Notify React that the scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private resize(gameSize: Phaser.Structs.Size) {
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;

        this.updateBoardPosition();
        this.adjustCamera();
    }

    private adjustCamera() {
        // Calculate board dimensions
        const boardWidth = CONSTANTS.GRID_COLS * CONSTANTS.CANDY_SIZE;
        const boardHeight = this.rows * CONSTANTS.CANDY_SIZE;

        // Add some padding
        const paddingX = 40;
        const paddingY = 160; // Increased vertical padding for better mobile UI spacing

        // Calculate zoom to fit board
        const zoomX = (this.gameWidth - paddingX) / boardWidth;
        const zoomY = (this.gameHeight - paddingY) / boardHeight;
        const zoom = Math.min(zoomX, zoomY, 1.5); // Allow up to 150% zoom on large screens

        this.cameras.main.setZoom(zoom);
        this.cameras.main.centerOn(
            this.startX + (boardWidth / 2) - (CONSTANTS.CANDY_SIZE / 2),
            this.startY + (boardHeight / 2) - (CONSTANTS.CANDY_SIZE / 2)
        );
    }

    private updateBoardPosition() {
        // We will now place the board centered at 0,0 conceptually for easier camera management,
        // OR we just calculate the center of the board and look at it.
        // For compatibility with existing spawn logic which uses startX/Y:
        const boardWidth = CONSTANTS.GRID_COLS * CONSTANTS.CANDY_SIZE;
        const boardHeight = this.rows * CONSTANTS.CANDY_SIZE;

        // Let's just center it in the world space relative to screen center being 0,0 is hard in phaser without config.
        // Let's stick to: Map is at coordinates X, Y. Camera looks at it.

        this.startX = (this.gameWidth - boardWidth) / 2 + CONSTANTS.CANDY_SIZE / 2;
        this.startY = (this.gameHeight - boardHeight) / 2 + CONSTANTS.CANDY_SIZE / 2;

        // But wait, if we zoom the camera, using gameWidth to calculate startX is tricky because gameWidth is screen pixels.
        // If we zoom, the world coordinates don't change, but the viewport does.

        // BETTER APPROACH for Responsiveness:
        // Always place the board at (0,0) or a fixed offset.
        // Use Camera to center on the board and Zoom to fit.

        // Let's anchor the board at a stable position, e.g. (1000, 1000) or just keep existing logic but apply zoom?
        // If we use existing logic, startX depends on gameWidth. if gameWidth changes, startX changes.
        // This is fine.
    }

    private generateTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        const S = CONSTANTS.CANDY_SIZE;
        const PADDING = S * 0.05; // 5% padding
        const DRAW_SIZE = S - (PADDING * 2);
        const RADIUS = S * 0.2; // 20% radius
        const SHINE_OFFSET = PADDING * 2;
        const SHINE_SIZE = DRAW_SIZE * 0.4;
        const STROKE_WIDTH = S * 0.05;

        // Particle Texture (Star)
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        const starSize = 20;
        graphics.fillCircle(starSize / 2, starSize / 2, starSize / 2);
        graphics.generateTexture('particle', starSize, starSize);

        CANDY_COLORS.forEach((color, index) => {
            graphics.clear();
            graphics.fillStyle(color, 1);
            // Square with rounded corners
            graphics.fillRoundedRect(PADDING, PADDING, DRAW_SIZE, DRAW_SIZE, RADIUS);

            // Shine effect
            graphics.fillStyle(0xffffff, 0.4);
            graphics.fillRoundedRect(SHINE_OFFSET, SHINE_OFFSET, SHINE_SIZE, SHINE_SIZE, RADIUS * 0.6);

            graphics.generateTexture(`candy_${index}`, S, S);
        });

        // Special candies textures (Striped)
        CANDY_COLORS.forEach((color, index) => {
            // Horizontal Striped
            graphics.clear();
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(PADDING, PADDING, DRAW_SIZE, DRAW_SIZE, RADIUS);
            graphics.lineStyle(STROKE_WIDTH, 0xffffff);
            graphics.lineBetween(PADDING * 2, S / 2, S - PADDING * 2, S / 2);
            graphics.generateTexture(`candy_striped_h_${index}`, S, S);

            // Vertical Striped
            graphics.clear();
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(PADDING, PADDING, DRAW_SIZE, DRAW_SIZE, RADIUS);
            graphics.lineStyle(STROKE_WIDTH, 0xffffff);
            graphics.lineBetween(S / 2, PADDING * 2, S / 2, S - PADDING * 2);
            graphics.generateTexture(`candy_striped_v_${index}`, S, S);

            // Wrapped
            graphics.clear();
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(PADDING, PADDING, DRAW_SIZE, DRAW_SIZE, RADIUS);
            graphics.lineStyle(STROKE_WIDTH / 2, 0xffffff);
            graphics.strokeRoundedRect(PADDING, PADDING, DRAW_SIZE, DRAW_SIZE, RADIUS);
            graphics.generateTexture(`candy_wrapped_${index}`, S, S);
        });
    }

    private createBoard() {
        this.children.removeAll();
        this.grid = Array(this.rows).fill(null).map(() => Array(CONSTANTS.GRID_COLS).fill(null));

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < CONSTANTS.GRID_COLS; c++) {
                let type;
                do {
                    type = Phaser.Math.Between(0, CONSTANTS.CANDY_TYPES - 1);
                } while (this.wouldMatch(r, c, type));
                this.spawnCandy(r, c, type);
            }
        }
    }

    private wouldMatch(r: number, c: number, type: number): boolean {
        // Check horizontal
        if (c >= 2) {
            const c1 = this.grid[r][c - 1];
            const c2 = this.grid[r][c - 2];
            if (c1 && c2 && c1.getData('type') === type && c2.getData('type') === type) return true;
        }
        // Check vertical
        if (r >= 2) {
            const r1 = this.grid[r - 1][c];
            const r2 = this.grid[r - 2][c];
            if (r1 && r2 && r1.getData('type') === type && r2.getData('type') === type) return true;
        }
        return false;
    }

    private spawnCandy(row: number, col: number, type: number): GameObjects.Sprite {
        const x = this.startX + col * CONSTANTS.CANDY_SIZE;
        const y = this.startY + row * CONSTANTS.CANDY_SIZE;
        const candy = this.add.sprite(x, y, `candy_${type}`);
        candy.setInteractive();
        candy.setData('row', row);
        candy.setData('col', col);
        candy.setData('type', type);
        this.grid[row][col] = candy;
        return candy;
    }

    private onCandyClicked(pointer: Phaser.Input.Pointer, candy: GameObjects.Sprite) {
        if (this.isProcessing || this.moves <= 0) return;

        this.soundManager.playSelect();

        if (!this.selectedCandy) {
            this.selectedCandy = candy;
            candy.setAlpha(0.5);
        } else {
            const target = candy;
            this.selectedCandy.setAlpha(1); // Reset alpha

            // Allow deselect
            if (this.selectedCandy === target) {
                this.selectedCandy = null;
                return;
            }

            const r1 = this.selectedCandy.getData('row');
            const c1 = this.selectedCandy.getData('col');
            const r2 = target.getData('row');
            const c2 = target.getData('col');

            // Any-to-Any Swap (Free Range)
            this.swapCandies(this.selectedCandy, target);

            this.selectedCandy = null;
        }
    }

    private swapCandies(candy1: GameObjects.Sprite, candy2: GameObjects.Sprite) {
        this.isProcessing = true;

        this.soundManager.playSwap();

        // Deduct move immediately for any swap attempt
        this.moves--;
        EventBus.emit('moves-update', this.moves);

        const r1 = candy1.getData('row');
        const c1 = candy1.getData('col');
        const r2 = candy2.getData('row');
        const c2 = candy2.getData('col');

        // Swap in grid
        this.grid[r1][c1] = candy2;
        this.grid[r2][c2] = candy1;

        // Update data
        candy1.setData('row', r2);
        candy1.setData('col', c2);
        candy2.setData('row', r1);
        candy2.setData('col', c1);

        // Visual swap
        this.tweens.add({
            targets: candy1,
            x: this.startX + c2 * CONSTANTS.CANDY_SIZE,
            y: this.startY + r2 * CONSTANTS.CANDY_SIZE,
            duration: CONSTANTS.ANIMATION_DURATION,
        });

        this.tweens.add({
            targets: candy2,
            x: this.startX + c1 * CONSTANTS.CANDY_SIZE,
            y: this.startY + r1 * CONSTANTS.CANDY_SIZE,
            duration: CONSTANTS.ANIMATION_DURATION,
            onComplete: () => {
                const matches = this.findMatches();
                if (matches.length > 0) {
                    this.processMatches(matches);
                } else {
                    // Swap back
                    this.soundManager.playInvalid();
                    this.swapBack(candy1, candy2);
                }
            }
        });
    }

    private swapBack(candy1: GameObjects.Sprite, candy2: GameObjects.Sprite) {
        const r1 = candy1.getData('row');
        const c1 = candy1.getData('col');
        const r2 = candy2.getData('row');
        const c2 = candy2.getData('col');

        // Swap in grid back
        this.grid[r1][c1] = candy2;
        this.grid[r2][c2] = candy1;

        candy1.setData('row', r2);
        candy1.setData('col', c2);
        candy2.setData('row', r1);
        candy2.setData('col', c1);

        this.tweens.add({
            targets: [candy1, candy2],
            props: {
                x: { getEnd: (target: GameObjects.Sprite) => this.startX + target.getData('col') * CONSTANTS.CANDY_SIZE },
                y: { getEnd: (target: GameObjects.Sprite) => this.startY + target.getData('row') * CONSTANTS.CANDY_SIZE }
            },
            duration: CONSTANTS.ANIMATION_DURATION,
            onComplete: () => {
                this.isProcessing = false;
            }
        });
    }

    private findMatches(): { cells: { r: number, c: number }[], type: number, specialType?: string }[] {
        const matches: { cells: { r: number, c: number }[], type: number, specialType?: string }[] = [];
        const visited = new Set<string>();

        // Horizontal matches
        for (let r = 0; r < this.rows; r++) {
            let count = 1;
            for (let c = 0; c < CONSTANTS.GRID_COLS; c++) {
                const current = this.grid[r][c];
                const next = c < CONSTANTS.GRID_COLS - 1 ? this.grid[r][c + 1] : null;

                if (current && next && current.getData('type') === next.getData('type')) {
                    count++;
                } else {
                    if (count >= 3) {
                        const cells = [];
                        for (let i = 0; i < count; i++) {
                            cells.push({ r, c: c - count + 1 + i });
                        }
                        matches.push({
                            cells,
                            type: this.grid[r][c - 1]!.getData('type'),
                            specialType: count >= 5 ? 'color_bomb' : (count === 4 ? 'striped_v' : undefined)
                        });
                    }
                    count = 1;
                }
            }
        }

        // Vertical matches
        for (let c = 0; c < CONSTANTS.GRID_COLS; c++) {
            let count = 1;
            for (let r = 0; r < this.rows; r++) {
                const current = this.grid[r][c];
                const next = r < this.rows - 1 ? this.grid[r + 1][c] : null;

                if (current && next && current.getData('type') === next.getData('type')) {
                    count++;
                } else {
                    if (count >= 3) {
                        const cells = [];
                        for (let i = 0; i < count; i++) {
                            cells.push({ r: r - count + 1 + i, c });
                        }
                        // Check for intersection with existing horizontal matches to form Wrapped
                        // Simple approach: Just push valid vertical lines.
                        // We will merge/resolution in processMatches or handle overlaps there.
                        matches.push({
                            cells,
                            type: this.grid[r - 1][c]!.getData('type'),
                            specialType: count >= 5 ? 'color_bomb' : (count === 4 ? 'striped_h' : undefined)
                        });
                    }
                    count = 1;
                }
            }
        }

        return matches;
    }

    private processMatches(rawMatches: { cells: { r: number, c: number }[], type: number, specialType?: string }[]) {
        if (rawMatches.length === 0) return;

        // Merge intersecting matches to find Wrapped (L/T shapes)
        // This is a naive implementation; for full robustness we'd use a union-find or graph.
        // For now, let's process simpler:
        // 1. Map all cells to be destroyed.
        // 2. Identify if any distinct match group generates a special candy.

        let pendingDestruction = new SetLikeCoords();
        let specialCreatons: { r: number, c: number, type: string }[] = [];

        // Check for L/T shapes (Wrapped)
        // A cell participating in both H and V match
        const cellcounts = new Map<string, number>();
        rawMatches.forEach(m => m.cells.forEach(cell => {
            const key = `${cell.r},${cell.c}`;
            cellcounts.set(key, (cellcounts.get(key) || 0) + 1);
            pendingDestruction.add(cell.r, cell.c);
        }));

        // Detect Wrapped
        cellcounts.forEach((count, key) => {
            if (count >= 2) {
                const [r, c] = key.split(',').map(Number);
                specialCreatons.push({ r, c, type: 'wrapped' });
            }
        });

        // Detect Striped / 5-Match
        rawMatches.forEach(m => {
            // Only create if not already part of a wrapped creation (intersection)
            // Ideally we pick the "moved" candy as source.
            if (m.specialType) {
                // Pick a cell to spawn. Prefer one that isn't creating a wrapped already?
                // Naive: Just pick the middle or first.
                // Ideally: Pick the one user swapped.
                const spawnCell = m.cells[Math.floor(m.cells.length / 2)];

                // If this cell is already making a wrapped, wrapped takes precedence? 
                // Usually 5 > Wrapped > Striped.
                if (!specialCreatons.some(s => s.r === spawnCell.r && s.c === spawnCell.c)) {
                    specialCreatons.push({ r: spawnCell.r, c: spawnCell.c, type: m.specialType });
                }
            }
        });

        // Score
        const points = pendingDestruction.size * CONSTANTS.POINTS_PER_CANDY;
        this.score += points;
        EventBus.emit('score-update', this.score);
        this.soundManager.playMatch();

        // Process special creations (adjust pendingDestruction)
        specialCreatons.forEach(creation => {
            // Don't destroy the one becoming special
            pendingDestruction.delete(creation.r, creation.c);
        });

        const destroyList = Array.from(pendingDestruction.values());

        // Execute Destruction (Recursive for cascading effects)
        this.destroyCandies(destroyList, () => {
            // Create Specials
            specialCreatons.forEach(s => {
                this.createSpecialCandy(s.r, s.c, s.type);
            });

            // Check if we need to drop
            this.time.delayedCall(250, () => {
                this.dropCandies();
            });
        });
    }

    private destroyCandies(cells: { r: number, c: number }[], onComplete: () => void) {
        if (cells.length === 0) {
            onComplete();
            return;
        }

        let processed = 0;
        const total = cells.length;

        // Identify secondary explosions (if destroying a special candy)
        const secondaryDestructions = new SetLikeCoords();

        cells.forEach(({ r, c }) => {
            const candy = this.grid[r][c];
            if (candy) {
                // Check special properties
                const key = candy.texture.key;
                const type = candy.getData('type');
                const color = CANDY_COLORS[type];

                // VFX
                this.particleEmitter.setParticleTint(color);
                this.particleEmitter.explode(8, candy.x, candy.y);

                if (key.includes('striped_h')) {
                    // Destroy Row
                    for (let k = 0; k < CONSTANTS.GRID_COLS; k++) secondaryDestructions.add(r, k);
                } else if (key.includes('striped_v')) {
                    // Destroy Col
                    for (let k = 0; k < this.rows; k++) secondaryDestructions.add(k, c);
                } else if (key.includes('wrapped')) {
                    // Destroy 3x3
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < CONSTANTS.GRID_COLS) secondaryDestructions.add(nr, nc);
                        }
                    }
                }

                this.grid[r][c] = null;
                this.tweens.add({
                    targets: candy,
                    scale: 0,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        candy.destroy();
                        processed++;
                        if (processed === total) {
                            // Handle secondary
                            const newTargets = Array.from(secondaryDestructions.values()).filter(t => this.grid[t.r][t.c] !== null);
                            if (newTargets.length > 0) {
                                this.destroyCandies(newTargets, onComplete);
                            } else {
                                onComplete();
                            }
                        }
                    }
                });
            } else {
                processed++;
                if (processed === total) onComplete();
            }
        });
    }

    private createSpecialCandy(r: number, c: number, specialType: string) {
        // Logic to replace the candy at r,c (which should be null or about to be null? Wait, we removed it from pendingDestruction)
        // Actually in processMatches we spared it from destruction, so grid[r][c] is NOT null, it's the old candy?
        // No, we need to transform it.

        const oldCandy = this.grid[r][c];
        if (oldCandy) {
            const type = oldCandy.getData('type');
            // Determine texture
            let texture = `candy_${type}`;
            if (specialType === 'striped_h') texture = `candy_striped_h_${type}`;
            else if (specialType === 'striped_v') texture = `candy_striped_v_${type}`;
            else if (specialType === 'wrapped') texture = `candy_wrapped_${type}`;
            else if (specialType === 'color_bomb') texture = `candy_wrapped_${type}`; // reusing wrapped for now or make new

            oldCandy.setTexture(texture);

            // Play upgrade sound/effect?
            this.tweens.add({
                targets: oldCandy,
                scale: { from: 1.5, to: 1 },
                duration: 300,
                ease: 'Back.out'
            });
        }
    }

    private dropCandies() {
        // Move down
        for (let c = 0; c < CONSTANTS.GRID_COLS; c++) {
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.grid[r][c] === null) {
                    // Find first candy above
                    for (let k = r - 1; k >= 0; k--) {
                        if (this.grid[k][c] !== null) {
                            // Move k to r
                            const candy = this.grid[k][c]!;
                            this.grid[r][c] = candy;
                            this.grid[k][c] = null;
                            candy.setData('row', r);

                            this.tweens.add({
                                targets: candy,
                                y: this.startY + r * CONSTANTS.CANDY_SIZE,
                                duration: 300,
                                ease: 'Bounce.easeOut'
                            });
                            break;
                        }
                    }
                }
            }
        }

        // Fill top
        this.time.delayedCall(300, () => {
            this.fillTop();
        });
    }

    private fillTop() {
        let spawned = false;
        for (let c = 0; c < CONSTANTS.GRID_COLS; c++) {
            for (let r = 0; r < this.rows; r++) {
                if (this.grid[r][c] === null) {
                    const type = Phaser.Math.Between(0, CONSTANTS.CANDY_TYPES - 1);
                    const candy = this.add.sprite(
                        this.startX + c * CONSTANTS.CANDY_SIZE,
                        this.startY - CONSTANTS.CANDY_SIZE, // Start above board
                        `candy_${type}`
                    );
                    candy.setInteractive();
                    candy.setData('row', r);
                    candy.setData('col', c);
                    candy.setData('type', type);
                    this.grid[r][c] = candy;
                    spawned = true;

                    this.tweens.add({
                        targets: candy,
                        y: this.startY + r * CONSTANTS.CANDY_SIZE,
                        duration: 400,
                        delay: r * 50,
                        ease: 'Bounce.easeOut'
                    });
                }
            }
        }

        if (spawned) {
            this.time.delayedCall(600, () => {
                const matches = this.findMatches();
                if (matches.length > 0) {
                    this.processMatches(matches); // Chain reaction
                } else {
                    this.isProcessing = false;
                    if (this.moves <= 0) {
                        // Game Over
                        EventBus.emit('moves-update', 0); // Ensure React knows
                        this.soundManager.playGameOver();
                    }
                }
            });
        } else {
            this.isProcessing = false;
        }
    }
}

class SetLikeCoords {
    private set = new Set<string>();

    add(r: number, c: number) {
        this.set.add(`${r},${c}`);
    }

    delete(r: number, c: number) {
        this.set.delete(`${r},${c}`);
    }

    get size() {
        return this.set.size;
    }

    values(): { r: number, c: number }[] {
        return Array.from(this.set).map(s => {
            const [r, c] = s.split(',').map(Number);
            return { r, c };
        });
    }
}

