class PennyGame {
  constructor() {
    this.hp = 100;
    this.hitCount = 0;
    this.isBeatenPhase = false;
    this.audioInit = false;
    this.failedCK = 0;

    // Görseller
    this.normal = document.getElementById("normalPenny");
    this.dovulmus = document.getElementById("dovulmusPenny");
    this.bitik = document.getElementById("bitikImage");
    this.olu = document.getElementById("oluImage");
    this.effect = document.getElementById("hitEffect");

    // UI Elemanları
    this.hitCountDisplay = document.getElementById("hitCount");
    this.healthBar = document.getElementById("healthBar");
    this.ckText = document.getElementById("ckText");
    this.ckResult = document.getElementById("ckResult");
    this.replay = document.getElementById("replayButton");
    
    // YENİ: Zafer Mesajı
    this.victoryMsg = document.getElementById("victoryMessage");
    
    this.gameContainer = document.getElementById("gameContainer");

    // CK Seçim Butonları
    this.ckChoicesContainer = document.getElementById("ckChoices");
    this.btnOlumlu = document.getElementById("btnOlumlu");
    this.btnOlumsuz = document.getElementById("btnOlumsuz");

    // Vuruş Butonları
    this.stickBtn = document.getElementById("stickButton");
    this.fistBtn = document.getElementById("fistButton");
    this.halilBtn = document.getElementById("halilButton");

    // Sesler
    this.sounds = {
      sopa: new Audio("Assets/sounds/sopases.mp3"),
      yumruk: new Audio("Assets/sounds/sopases.mp3"),
      halil: new Audio("Assets/sounds/pic.mp3"),
      aci: new Audio("Assets/sounds/piciminpici1.mp3"),
      penny1: new Audio("Assets/sounds/penny1.mp3"),
      penny2: new Audio("Assets/sounds/penny2.mp3"),
      penny3: new Audio("Assets/sounds/penny3.mp3"),
      bg: document.getElementById("bgMusic")
    };

    this.sounds.bg.volume = 0.02;

    this.init();
  }

  init() {
    document.addEventListener(
      "click",
      () => {
        if (this.audioInit) return;
        this.audioInit = true;
        Object.values(this.sounds).forEach((s) => {
          if (s.play) {
            s.play().then(() => {
              if (s !== this.sounds.bg) {
                s.pause();
                s.currentTime = 0;
              }
            }).catch(()=>{});
          }
        });
        this.sounds.bg.play().catch(()=>{});
      },
      { once: true }
    );

    this.bindEvents();
    this.showOnly(this.normal);
    this.updateHealth();
  }

  bindEvents() {
    this.stickBtn.onclick = () => this.hit("sopa");
    this.fistBtn.onclick = () => this.hit("yumruk");
    this.halilBtn.onclick = () => this.hit("halil");
    this.replay.onclick = () => this.reset();
    this.btnOlumlu.onclick = () => this.handleCKChoice(true);
    this.btnOlumsuz.onclick = () => this.handleCKChoice(false);
  }

  hit(type) {
    if (this.hp <= 0) return;

    this.triggerWeaponAnim(type);

    this.hitCount++;
    this.hitCountDisplay.textContent = this.hitCount;
    if (this.hitCount >= 5) this.isBeatenPhase = true;

    this.hp -= 10;
    if (this.hp < 0) this.hp = 0;
    this.updateHealth();

    // 1. Vuruş sesi
    this.play(type);
    
    const reactionSounds = ["aci", "penny1", "penny2", "penny3"];
    const randomSound = reactionSounds[Math.floor(Math.random() * reactionSounds.length)];

    // 2. Tepki sesi (500ms sonra)
    setTimeout(() => this.play(randomSound), 500); 

    setTimeout(() => {
        this.updatePenny();
        this.effectAnim();
    }, 250);

    if (this.hp === 0) this.startCKProcess();
  }

  triggerWeaponAnim(type) {
    let imgSrc = "";
    if (type === "sopa") imgSrc = "Assets/images/sopa.png";
    else if (type === "yumruk") imgSrc = "Assets/images/yumruk.png";
    else if (type === "halil") imgSrc = "Assets/images/halil.png";

    const weaponImg = document.createElement("img");
    weaponImg.src = imgSrc;
    weaponImg.className = "anim-weapon strike-motion";

    this.gameContainer.appendChild(weaponImg);

    setTimeout(() => {
        weaponImg.remove();
    }, 450);
  }

  updatePenny() {
    if (this.hp <= 0) return;

    if (!this.isBeatenPhase) {
      this.showOnly(this.dovulmus);
      setTimeout(() => this.showOnly(this.normal), 400);
    } else {
      this.showOnly(this.bitik);
      setTimeout(() => this.showOnly(this.dovulmus), 400);
    }
  }

  showOnly(active) {
    [this.normal, this.dovulmus, this.bitik, this.olu].forEach(
      (x) => (x.style.display = "none")
    );
    if (active) {
        active.style.display = "block";
        active.classList.remove("shake");
        void active.offsetWidth; 
        active.classList.add("shake");
    }
  }

  updateHealth() {
    this.healthBar.style.width = this.hp + "%";
    if (this.hp > 60) this.healthBar.style.background = "#2ecc71";
    else if (this.hp > 30) this.healthBar.style.background = "#f1c40f";
    else this.healthBar.style.background = "#e74c3c";
  }

  effectAnim() {
    this.effect.style.display = "block";
    setTimeout(() => (this.effect.style.display = "none"), 300);
  }

  async startCKProcess() {
    this.ckText.innerText = "/do ck izni";
    this.ckText.style.opacity = 1;
    await this.sleep(800);
    this.ckChoicesContainer.style.display = "flex";
  }

  handleCKChoice(isOlumlu) {
    this.ckChoicesContainer.style.display = "none";
    this.ckText.style.opacity = 0;

    if (isOlumlu) {
      // OLUMLU (Ölüm)
      this.showOnly(this.olu);
      this.replay.style.display = "block";
      this.victoryMsg.style.display = "block"; // MESAJ GÖRÜNÜR
    } else {
      // OLUMSUZ (Devam)
      this.ckResult.innerText = "olumsuz";
      this.ckResult.style.opacity = 1;

      this.failedCK++;
      const restoreValues = [75, 50, 20, 0];
      const nextHP = restoreValues[Math.min(this.failedCK - 1, restoreValues.length - 1)];
      this.hp = nextHP;
      
      if (this.hp === 0) {
        // Reddede reddede öldü
        this.showOnly(this.olu);
        this.replay.style.display = "block";
        this.victoryMsg.style.display = "block"; // MESAJ GÖRÜNÜR
        this.ckResult.style.opacity = 0;
        return;
      }
      
      this.updateHealth();
      this.showOnly(this.dovulmus);

      setTimeout(() => {
        this.ckResult.style.opacity = 0;
      }, 1200);
    }
  }

  play(name) {
    const s = this.sounds[name];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  reset() {
    this.hp = 100;
    this.hitCount = 0;
    this.isBeatenPhase = false;
    this.failedCK = 0;
    this.replay.style.display = "none";
    this.victoryMsg.style.display = "none"; // MESAJ GİZLENİR
    this.ckText.style.opacity = 0;
    this.ckResult.style.opacity = 0;
    this.ckChoicesContainer.style.display = "none";
    this.updateHealth();
    this.hitCountDisplay.textContent = "0";
    this.showOnly(this.normal);
  }
}

document.addEventListener("DOMContentLoaded", () => new PennyGame());