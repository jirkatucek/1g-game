export default class PreloadScene extends Phaser.Scene {
    constructor() { super({ key: 'PreloadScene' }); }

    create() {
        this.createTiles();
        this.createCharacters();
        this.scene.start('MenuScene');
    }

    createTiles() {
        const g = this.add.graphics();

        // Grass
        g.fillStyle(0x4a7c59); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x3d6b4b); g.fillRect(0, 0, 1, 32); g.fillRect(0, 0, 32, 1);
        g.generateTexture('grass', 32, 32); g.clear();

        // Tree
        g.fillStyle(0x1a3a0a); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x2d6614); g.fillCircle(16, 13, 11);
        g.fillStyle(0x5a3a1a); g.fillRect(13, 22, 6, 10);
        g.generateTexture('tree', 32, 32); g.clear();

        // Path
        g.fillStyle(0xc4a35a); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xb8944e); g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32);
        g.generateTexture('path', 32, 32); g.clear();

        // Water
        g.fillStyle(0x1a55bb); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x2266cc); g.fillRect(3, 8, 26, 4); g.fillRect(1, 20, 30, 4);
        g.generateTexture('water', 32, 32); g.clear();

        g.destroy();
    }

    createCharacters() {
        const g = this.add.graphics();

        // Player - knight (blue armor)
        this.drawKnight(g, 'player', 0x3a80cc, 0x1a50aa);

        // Goblin - small green creature
        this.drawEnemy(g, 'goblin', 0x55aa22, 0x336611, 0x22ee00);
        // Orc - large brown brute
        this.drawEnemy(g, 'orc', 0x8b5a14, 0x5a3a00, 0xff6600);
        // Dragon - red beast
        this.drawEnemy(g, 'dragon', 0xcc2222, 0x881111, 0xff8800);

        // NPC - golden villager
        this.drawNPC(g, 'npc', 0xdd9922);

        g.destroy();
    }

    drawKnight(g, key, body, shadow) {
        g.clear();
        // Legs
        g.fillStyle(shadow); g.fillRect(9, 22, 6, 9); g.fillRect(17, 22, 6, 9);
        // Body armor
        g.fillStyle(body); g.fillRect(8, 12, 16, 12);
        // Shoulder pads
        g.fillStyle(shadow); g.fillRect(5, 12, 5, 6); g.fillRect(22, 12, 5, 6);
        // Head
        g.fillStyle(0xffc8a0); g.fillRect(11, 5, 10, 8);
        // Helmet
        g.fillStyle(shadow); g.fillRect(10, 3, 12, 6);
        // Visor
        g.fillStyle(0x88aacc); g.fillRect(12, 6, 8, 3);
        // Sword
        g.fillStyle(0xdddddd); g.fillRect(25, 7, 3, 18);
        g.fillStyle(0xcc9900); g.fillRect(23, 13, 7, 3);
        // Shield
        g.fillStyle(body); g.fillRect(1, 13, 8, 11);
        g.fillStyle(0xffdd00); g.fillRect(3, 15, 4, 7);
        g.generateTexture(key, 32, 32);
    }

    drawEnemy(g, key, body, shadow, eye) {
        g.clear();
        // Feet
        g.fillStyle(shadow); g.fillRect(7, 24, 7, 8); g.fillRect(18, 24, 7, 8);
        // Body
        g.fillStyle(body); g.fillRect(7, 12, 18, 14);
        // Head
        g.fillRect(9, 4, 14, 10);
        // Eyes
        g.fillStyle(eye); g.fillRect(11, 7, 4, 4); g.fillRect(18, 7, 4, 4);
        g.fillStyle(0x000000); g.fillRect(12, 8, 2, 2); g.fillRect(19, 8, 2, 2);
        // Arms
        g.fillStyle(shadow); g.fillRect(2, 13, 6, 10); g.fillRect(24, 13, 6, 10);
        // Claws
        g.fillStyle(0x111111);
        g.fillRect(2, 22, 3, 4); g.fillRect(5, 22, 3, 4);
        g.fillRect(24, 22, 3, 4); g.fillRect(27, 22, 3, 4);
        g.generateTexture(key, 32, 32);
    }

    drawNPC(g, key, color) {
        g.clear();
        // Robe
        g.fillStyle(color); g.fillRect(9, 12, 14, 18);
        // Head
        g.fillStyle(0xffc8a0); g.fillRect(11, 4, 10, 10);
        // Hat
        g.fillStyle(0xaa7700); g.fillRect(9, 2, 14, 4);
        // Eyes
        g.fillStyle(0x333333); g.fillRect(13, 7, 2, 2); g.fillRect(17, 7, 2, 2);
        // Staff
        g.fillStyle(0x885500); g.fillRect(25, 2, 3, 28);
        g.fillStyle(0x44aaff); g.fillCircle(26, 4, 4);
        g.generateTexture(key, 32, 32);
    }
}
