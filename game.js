class PennyGame {
  constructor() {
    this.hp = 100;
    this.hitCount = 0;
    this.isBeatenPhase = false;
    this.audioInit = false;
    this.failedCK = 0; // Her olumsuz için sayaç

    // Görseller
    this.normal = document.getElementById("normalPenny");
    this.dovulmus = document.getElementById("dovulmusPenny");
    this.bitik = document.getElementById("bitikImage");
    this.olu = document.getElementById("oluImage");
    this.effect = document.getElementById("hitEffect");

    // UI
    this.hitCountDisplay = document.getElementById("hitCount");
    this.healthBar = document.getElementById("healthBar");
    this.ckText = document.getElementById("ckText");
    this.ckResult = document.getElementById("ckResult");
    this.replay = document.getElementById("replayButton");

    // Butonlar
    this.stickBtn = document.getElementById("stickButton");
    this.fistBtn = document.getElementById("fistButton");
    this.halilBtn = document.getElementById("halilButton");

    // Sesler
    this.sounds = {
      sopa: new Audio("Assets/sounds/sopases.mp3"),
      yumruk: new Audio("Assets/sounds/sopases.mp3"),
      halil: new Audio("Assets/sounds/fahhh.mp3"),
      aci: new Audio("Assets/sounds/piciminpici1.mp3"),
      bg: document.getElementById("bgMusic")
    };
    this.sounds.bg.volume = 0.15; // çok kısık sesle

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
  }

  hit(type) {
    if (this.hp <= 0) return;

    this.hitCount++;
    this.hitCountDisplay.textContent = this.hitCount;
    if (this.hitCount >= 5) this.isBeatenPhase = true;

    this.hp -= 10;
    if (this.hp < 0) this.hp = 0;
    this.updateHealth();

    this.play(type);
    setTimeout(() => this.play("aci"), 200);
    this.updatePenny();
    this.effectAnim();

    if (this.hp === 0) this.checkCK();
  }

  updatePenny() {
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
    if (active) active.style.display = "block";
  }

  updateHealth() {
    this.healthBar.style.width = this.hp + "%";
    if (this.hp > 60) this.healthBar.style.background = "green";
    else if (this.hp > 30) this.healthBar.style.background = "yellow";
    else this.healthBar.style.background = "red";
  }

  effectAnim() {
    this.effect.style.display = "block";
    setTimeout(() => (this.effect.style.display = "none"), 300);
  }

  async checkCK() {
    this.ckText.innerText = "/do ck izni";
    this.ckText.style.opacity = 1;
    await this.sleep(800);

    const izin = Math.random() < 0.5;
    this.ckResult.innerText = izin ? "olumlu" : "olumsuz";
    this.ckResult.style.opacity = 1;

    if (izin) {
      this.showOnly(this.olu);
      this.replay.style.display = "block";
    } else {
      this.failedCK++;
      // Her seferinde can biraz daha azalıyor:
      const restoreValues = [75, 50, 20, 0];
      const nextHP = restoreValues[Math.min(this.failedCK - 1, restoreValues.length - 1)];
      this.hp = nextHP;
      this.updateHealth();

      if (this.hp === 0) {
        this.showOnly(this.olu);
        this.replay.style.display = "block";
        return;
      }

      this.showOnly(this.dovulmus);
      setTimeout(() => {
        this.ckText.style.opacity = 0;
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
    this.ckText.style.opacity = 0;
    this.ckResult.style.opacity = 0;
    this.updateHealth();
    this.showOnly(this.normal);
  }
}

document.addEventListener("DOMContentLoaded", () => new PennyGame());
