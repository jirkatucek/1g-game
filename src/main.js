import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import BattleScene from './scenes/BattleScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

function isMobileDevice() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const touch = typeof navigator.maxTouchPoints === 'number' ? navigator.maxTouchPoints > 0 : 'ontouchstart' in window;
    const smallScreen = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) <= 900;
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua) || (touch && smallScreen);
}

function showMobileBlocker() {
    const el = document.createElement('div');
    el.id = 'mobile-blocker';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.background = 'linear-gradient(180deg, rgba(10,10,20,0.95), rgba(5,5,10,0.98))';
    el.style.color = '#fff';
    el.style.zIndex = '99999';
    el.style.padding = '24px';
    el.style.boxSizing = 'border-box';

    const box = document.createElement('div');
    box.style.maxWidth = '820px';
    box.style.textAlign = 'center';

    const title = document.createElement('h1');
    title.textContent = 'Hra není dostupná na mobilních zařízeních';
    title.style.margin = '0 0 12px 0';
    title.style.fontFamily = 'Arial, sans-serif';
    title.style.fontSize = '28px';

    const msg = document.createElement('p');
    msg.textContent = 'Tato hra je hratelná pouze na počítači (desktop). Otevřete prosím stránku na PC pro plnohodnotný zážitek.';
    msg.style.margin = '0 0 18px 0';
    msg.style.fontSize = '18px';

    const hint = document.createElement('p');
    hint.textContent = 'Doporučujeme použít desktopový prohlížeč (Chrome / Edge / Firefox).';
    hint.style.margin = '0 0 22px 0';
    hint.style.opacity = '0.85';

    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(hint);

    el.appendChild(box);
    document.body.appendChild(el);
}

const shouldBlock = isMobileDevice();

if (shouldBlock) {
    // Show message and do not initialize the game on mobile devices
    try { showMobileBlocker(); } catch (e) { /* ignore DOM errors */ }
} else {
    const config = {
        type: Phaser.AUTO,
        backgroundColor: '#0a0a1a',
        pixelArt: true,
        scale: {
            mode: Phaser.Scale.FILL,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1280,
            height: 720,
            parent: document.body,
            expandParent: true,
        },
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 }, debug: false }
        },
        scene: [PreloadScene, MenuScene, GameScene, BattleScene, GameOverScene, VictoryScene]
    };

    new Phaser.Game(config);
}
