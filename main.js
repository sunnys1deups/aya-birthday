document.addEventListener("DOMContentLoaded", () => {
  const birthdayIcon = document.getElementById("birthdayIcon");
  const windowOverlay = document.getElementById("windowOverlay");
  const closeBtn = document.getElementById("closeBtn");
  const steps = [...document.querySelectorAll(".flow-step")];
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const captchaArena = document.getElementById("captchaArena");
  const captchaMessage = document.getElementById("captchaMessage");
  const captchaContinue = document.getElementById("captchaContinue");
  const letterOverlay = document.getElementById("letterOverlay");
  const letterBackBtn = document.getElementById("letterBackBtn");
  const letterNextBtn = document.getElementById("letterNextBtn");
  const letterPages = [document.getElementById("letterPage"), document.getElementById("wishPage")];
  const letterDots = [document.getElementById("letterDot1"), document.getElementById("letterDot2")];
  const wishInput = document.getElementById("wishInput");
  const cakeButton = document.getElementById("cakeButton");
  const wishCake = document.getElementById("wishCake");
  const wishMessage = document.getElementById("wishMessage");
  const counts = { earjen: 0, jordan: 0 };
  const targetInfo = {
    earjen: { image: "earjen.png", label: "Earjen" },
    jordan: { image: "jordan.png", label: "Jordan" },
  };
  const activeTargets = new Set();
  let spawnTimer;
  let gameStarted = false;

  function showStep(stepId) {
    steps.forEach((step) => {
      step.hidden = step.id !== stepId;
    });
    const heading = document.querySelector(`#${stepId} h1`);
    if (heading) heading.focus({ preventScroll: true });
  }

  function stopCaptcha() {
    window.clearInterval(spawnTimer);
    activeTargets.forEach((target) => target.remove());
    activeTargets.clear();
    gameStarted = false;
  }

  function resetFlow() {
    stopCaptcha();
    counts.earjen = 0;
    counts.jordan = 0;
    document.getElementById("earjenCount").textContent = "0";
    document.getElementById("jordanCount").textContent = "0";
    document.getElementById("password").value = "";
    document.getElementById("username").value = "";
    document.getElementById("agreeTerms").checked = false;
    document.getElementById("termsError").textContent = "";
    loginError.textContent = "";
    captchaContinue.hidden = true;
    captchaMessage.textContent = "Kolektahin mo teh, wag mo pindutin yung bomba";
    captchaArena.querySelectorAll(".captcha-target").forEach((target) => target.remove());
    showStep("loginStep");
  }

  function updateScore() {
    document.getElementById("earjenCount").textContent = String(counts.earjen);
    document.getElementById("jordanCount").textContent = String(counts.jordan);
    if (counts.earjen >= 10 && counts.jordan >= 10) {
      stopCaptcha();
      captchaMessage.textContent = "YAY!";
      captchaContinue.hidden = false;
    }
  }

  function spawnTarget() {
    if (counts.earjen >= 10 && counts.jordan >= 10) return;
    const isBomb = Math.random() < 0.18;
    const remaining = Object.keys(counts).filter((name) => counts[name] < 10);
    const kind = isBomb ? "bomb" : remaining[Math.floor(Math.random() * remaining.length)];
    const info = targetInfo[kind];
    const target = document.createElement("button");
    target.type = "button";
    target.className = `captcha-target target-${kind}`;
    target.setAttribute("aria-label", isBomb ? "Bomb: lose one of each character" : `Catch ${info.label}`);
    target.style.left = `${8 + Math.random() * 76}%`;
    target.style.top = `${10 + Math.random() * 68}%`;
    if (isBomb) {
      target.classList.add("captcha-bomb");
      target.textContent = "💣";
    } else {
      const image = document.createElement("img");
      image.src = info.image;
      image.alt = "";
      image.draggable = false;
      target.append(image);
    }
    captchaArena.append(target);
    activeTargets.add(target);

    const expireTimer = window.setTimeout(() => {
      target.remove();
      activeTargets.delete(target);
    }, 2300);
    target.addEventListener("click", () => {
      window.clearTimeout(expireTimer);
      target.remove();
      activeTargets.delete(target);
      if (isBomb) {
        counts.earjen = Math.max(0, counts.earjen - 1);
        counts.jordan = Math.max(0, counts.jordan - 1);
        captchaMessage.textContent = "Hala ka bakla...";
      } else {
        counts[kind] = Math.min(10, counts[kind] + 1);
      }
      updateScore();
    }, { once: true });
  }

  function startCaptcha() {
    if (gameStarted) return;
    gameStarted = true;
    document.getElementById("arenaInstruction").hidden = true;
    spawnTarget();
    spawnTimer = window.setInterval(spawnTarget, 850);
  }

  birthdayIcon.addEventListener("click", () => {
    resetFlow();
    windowOverlay.classList.remove("hidden");
    document.getElementById("username").focus({ preventScroll: true });
  });

  closeBtn.addEventListener("click", () => {
    stopCaptcha();
    windowOverlay.classList.add("hidden");
  });

  windowOverlay.addEventListener("click", (event) => {
    if (event.target === windowOverlay) {
      stopCaptcha();
      windowOverlay.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!letterOverlay.classList.contains("hidden")) letterOverlay.classList.add("hidden");
      if (!windowOverlay.classList.contains("hidden")) {
        stopCaptcha();
        windowOverlay.classList.add("hidden");
      }
    }
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username) {
      loginError.textContent = "Lagyan mo username.";
      document.getElementById("username").focus();
      return;
    }
    if (password !== "09/29/2026" && password !== "9/29/2026") {
      loginError.textContent = "Yung birthday mo teh.";
      document.getElementById("password").focus();
      return;
    }
    loginError.textContent = "";
    showStep("captchaStep");
    startCaptcha();
  });

  captchaContinue.addEventListener("click", () => showStep("termsStep"));

  document.getElementById("acceptTermsBtn").addEventListener("click", () => {
    const termsError = document.getElementById("termsError");
    if (!document.getElementById("agreeTerms").checked) {
      termsError.textContent = "umagree ka muna akla";
      return;
    }
    termsError.textContent = "";
    stopCaptcha();
    windowOverlay.classList.add("hidden");
    letterOverlay.classList.remove("hidden");
    showLetterPage(0);
  });

  function showLetterPage(index) {
    const pageIndex = Math.max(0, Math.min(index, letterPages.length - 1));
    letterPages.forEach((page, currentIndex) => {
      page.hidden = currentIndex !== pageIndex;
      letterDots[currentIndex].classList.toggle("is-active", currentIndex === pageIndex);
      if (currentIndex === pageIndex) letterDots[currentIndex].setAttribute("aria-current", "step");
      else letterDots[currentIndex].removeAttribute("aria-current");
    });
    letterBackBtn.disabled = pageIndex === 0;
    letterNextBtn.disabled = pageIndex === letterPages.length - 1;
    const heading = letterPages[pageIndex].querySelector("h1");
    if (heading) heading.focus({ preventScroll: true });
  }

  letterBackBtn.addEventListener("click", () => showLetterPage(0));
  letterNextBtn.addEventListener("click", () => showLetterPage(1));
  wishInput.addEventListener("input", () => {
    cakeButton.disabled = wishInput.value.trim().length === 0 || wishCake.dataset.blown === "true";
  });
  cakeButton.addEventListener("click", () => {
    if (!wishInput.value.trim() || wishCake.dataset.blown === "true") return;
    wishCake.src = "cakeblew.png";
    wishCake.alt = "Birthday cake with its candle blown out";
    wishCake.dataset.blown = "true";
    cakeButton.disabled = true;
    wishMessage.textContent = "YEHEY HAPPY";
  });

  resetFlow();
});