class PennyGame {
    constructor() {
        this.hitCount = 0;
        this.audioInitialized = false;
        this.isBeatenPhase = false; // 5. vuruştan sonra true olacak

        // Penny görselleri
        this.normal = document.getElementById('normalPenny');
        this.dovulmus = document.getElementById('dovulmusPenny');
        this.bitik = document.getElementById('bitikImage');
        this.effect = document.getElementById('hitEffect');
        this.hitCountDisplay = document.getElementById('hitCount');

        // Butonlar
        this.stickBtn = document.getElementById('stickButton');
        this.fistBtn = document.getElementById('fistButton');
        this.halilBtn = document.getElementById('halilButton');

        // Sesler
        this.sounds = {
            sopa: new Audio('Assets/sounds/sopases.mp3'),
            yumruk: new Audio('Assets/sounds/sopases.mp3'),
            halil: new Audio('Assets/sounds/fahhh.mp3'),
            aci: new Audio('Assets/sounds/piciminpici1.mp3')
        };

        this.preloadImages();
        this.initSounds();
        this.bindEvents();

        this.showOnly(this.normal);
        console.log('PENNY DÖV – Halil Game modu aktif!');
    }

    preloadImages() {
        const imageUrls = [
            'Assets/images/normal_penny.png',
            'Assets/images/dovulmus.png',
            'Assets/images/bitik.png',
            'Assets/images/sopa.png',
            'Assets/images/yumruk.png',
            'Assets/images/halil.png'
        ];

        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = () => console.log(`✅ Yüklendi: ${url}`);
            img.onerror = () => console.error(`❌ Yüklenemedi: ${url}`);
            img.src = url;
        });
    }

    initSounds() {
        Object.values(this.sounds).forEach(s => {
            s.preload = 'auto';
            s.volume = 0.8;
            s.load();
        });

        const activateAudio = () => {
            if (this.audioInitialized) return;
            Object.values(this.sounds).forEach(s => {
                s.play().then(() => {
                    s.pause();
                    s.currentTime = 0;
                }).catch(() => {});
            });
            this.audioInitialized = true;
            console.log('🔊 Sesler aktifleştirildi');
        };

        document.addEventListener('click', activateAudio, { once: true });
        document.addEventListener('touchstart', activateAudio, { once: true });
    }

    bindEvents() {
        this.stickBtn.onclick = () => this.hit('sopa', this.stickBtn, 'sopa-weapon');
        this.fistBtn.onclick = () => this.hit('yumruk', this.fistBtn, 'yumruk-weapon');
        this.halilBtn.onclick = () => this.hit('halil', this.halilBtn, 'halil-weapon');
    }

    hit(type, button, weaponClass) {
        if (!this.audioInitialized) {
            Object.values(this.sounds).forEach(s => {
                s.play().then(() => {
                    s.pause();
                    s.currentTime = 0;
                }).catch(() => {});
            });
            this.audioInitialized = true;
        }

        this.hitCount++;
        this.hitCountDisplay.textContent = this.hitCount;

        // 5. vuruştan itibaren "dayak yedi modu"
        if (this.hitCount >= 5) this.isBeatenPhase = true;

        this.newAttackAnimation(button, weaponClass);
        this.updatePenny();
        this.newHitEffect();
        this.betterShake();
        this.play(type);

        setTimeout(() => this.play('aci'), 250);
    }

    newAttackAnimation(button, weaponClass) {
        const weaponImg = button.querySelector('img').cloneNode(true);
        weaponImg.className = `attack-weapon ${weaponClass}`;
        weaponImg.style.top = '50%';
        weaponImg.style.left = '180px';
        document.body.appendChild(weaponImg);

        setTimeout(() => {
            if (weaponImg.parentNode) weaponImg.remove();
        }, 600);
    }

    newHitEffect() {
        const x = (Math.random() - 0.5) * 120;
        const y = (Math.random() - 0.5) * 120;

        this.effect.style.left = x + 'px';
        this.effect.style.top = y + 'px';
        this.effect.style.display = 'block';

        setTimeout(() => {
            this.effect.style.display = 'none';
        }, 400);
    }

    betterShake() {
        const currentImg = [this.normal, this.dovulmus, this.bitik].find(
            img => img.style.display === 'block'
        );
        if (currentImg) {
            currentImg.classList.add('shake');
            setTimeout(() => currentImg.classList.remove('shake'), 350);
        }
    }

    /* 🔥 YENİ SIRALAMA MANTIĞI */
    updatePenny() {
        if (!this.isBeatenPhase) {
            // İlk 1–4 vuruş
            this.showOnly(this.dovulmus);
            setTimeout(() => {
                this.showOnly(this.normal);
            }, 500);
        } else {
            // 5. vuruştan SONRA
            this.showOnly(this.bitik); // dayak anında bitik resmi
            setTimeout(() => {
                this.showOnly(this.dovulmus); // artık kalıcı dovulmus
            }, 500);
        }
    }

    showOnly(activeImg) {
        this.normal.style.display = 'none';
        this.dovulmus.style.display = 'none';
        this.bitik.style.display = 'none';
        activeImg.style.display = 'block';
    }

    play(name) {
        const s = this.sounds[name];
        if (!s) return;
        s.currentTime = 0;
        s.play().catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PennyGame();
});

