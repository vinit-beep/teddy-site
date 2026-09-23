(() => {
  /* =============================================
     VARSHA TEDDY STUDIO — Complete Script
     ============================================= */

  // === 1. SCROLL SEQUENCE (HERO CANVAS) ===
  const frameCount = 177;
  const framePath = (index) => `images/teddy-sequence/ezgif-frame-${String(index + 1).padStart(3, '0')}.png`;

  const canvas = document.getElementById('sequenceCanvas');
  const sequenceSection = document.querySelector('.sequence') || document.getElementById('sequence');
  const sequenceStage = document.querySelector('.sequence-stage');
  const sequenceFrameLabel = document.getElementById('sequenceFrameLabel');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const images = new Array(frameCount);
  let currentFrame = -1;
  let targetFrame = 0;
  let rafId = null;

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (currentFrame >= 0 && images[currentFrame]?.complete) drawFrame(currentFrame);
  }

  function drawFrame(index) {
    if (!ctx) return;
    const image = images[index];
    if (!image || !image.complete || image.naturalWidth === 0) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight);
    const drawW = image.naturalWidth * scale;
    const drawH = image.naturalHeight * scale;
    const x = (w - drawW) / 2;
    const y = (h - drawH) / 2;

    ctx.drawImage(image, x, y, drawW, drawH);
    currentFrame = index;
    if (sequenceFrameLabel) sequenceFrameLabel.textContent = `${index + 1} / ${frameCount}`;
  }

  function requestFrame(index) {
    index = Math.max(0, Math.min(frameCount - 1, index));
    if (index === currentFrame) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      drawFrame(index);
      rafId = null;
    });
  }

  function loadImage(index) {
    if (images[index]) return images[index];
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (index === targetFrame) {
        drawFrame(index);
      }
    };
    img.src = framePath(index);
    images[index] = img;
    return img;
  }

  function preloadAround(index) {
    const radius = 12;
    for (let offset = -radius; offset <= radius; offset++) {
      const i = index + offset;
      if (i >= 0 && i < frameCount) loadImage(i);
    }
  }

  function updateSequence() {
    if (!sequenceSection) return;
    const rect = sequenceSection.getBoundingClientRect();
    const scrollable = Math.max(1, sequenceSection.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    const index = Math.round(progress * (frameCount - 1));
    targetFrame = index;
    preloadAround(index);
    requestFrame(index);

    // Animate supporting copy
    const left = document.querySelector('.sequence-copy-left');
    const right = document.querySelector('.sequence-copy-right');
    const finalCopy = document.querySelector('.sequence-copy-final');
    if (left) {
      const opacity = 1 - Math.min(1, Math.max(0, (progress - 0.10) / 0.22));
      left.style.opacity = opacity;
      left.style.transform = `translateY(${progress * -16}px)`;
    }
    if (right) {
      const p = Math.max(0, Math.min(1, (progress - 0.22) / 0.30));
      right.style.opacity = p * (1 - Math.max(0, (progress - 0.54) / 0.14));
      right.style.transform = `translateY(${30 - p * 30}px)`;
    }
    if (finalCopy) {
      const p = Math.max(0, Math.min(1, (progress - 0.60) / 0.22));
      finalCopy.style.opacity = p;
      finalCopy.style.transform = `translateY(${30 - p * 30}px)`;
    }
  }

  if (canvas && sequenceSection) {
    const firstImg = loadImage(0);
    const initSequence = () => {
      resizeCanvas();
      drawFrame(0);
      preloadAround(0);
      let next = 1;
      const batch = () => {
        const end = Math.min(frameCount, next + 12);
        for (; next < end; next++) loadImage(next);
        if (next < frameCount) window.setTimeout(batch, 30);
      };
      batch();
    };

    if (firstImg.complete) {
      initSequence();
    } else {
      firstImg.onload = initSequence;
    }

    window.addEventListener('scroll', updateSequence, { passive: true });
    window.addEventListener('resize', resizeCanvas);
    updateSequence();
  }


  // === 2. NAVBAR ===
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav');
  if (menu && nav) {
    menu.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', () => nav.classList.remove('open'))
    );
  }

  // Scrolled state for nav
  let lastScrollY = 0;
  function handleNavScroll() {
    if (!nav) return;
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();


  // === 3. SCROLL REVEAL ANIMATION ===
  const revealItems = document.querySelectorAll('.reveal-item');
  if (revealItems.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger the animation based on position in parent
          const siblings = entry.target.parentElement.querySelectorAll('.reveal-item');
          let idx = 0;
          siblings.forEach((s, j) => { if (s === entry.target) idx = j; });
          entry.target.style.transitionDelay = `${idx * 80}ms`;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    // Fallback: show everything immediately
    revealItems.forEach((item) => item.classList.add('visible'));
  }


  // === 4. TEDDY CUSTOMIZER ===
  const customizerState = {
    size: 'classic',
    sizePrice: 300,
    sizeLabel: 'Classic · 12 inch',
    color: 'pink',
    colorBg: '#fde8e8',
    colorLabel: 'Soft Pink',
    accessories: [],
    accessoryPrices: {},
  };

  // Size selector
  const sizeOptions = document.getElementById('sizeOptions');
  if (sizeOptions) {
    sizeOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.size-btn');
      if (!btn) return;

      sizeOptions.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      customizerState.size = btn.dataset.size;
      customizerState.sizePrice = parseInt(btn.dataset.price, 10);
      customizerState.sizeLabel = btn.dataset.label;

      // Update preview teddy size
      const previewTeddy = document.getElementById('previewTeddy');
      if (previewTeddy) {
        const sizes = { mini: 80, classic: 120, large: 160, giant: 200 };
        previewTeddy.style.fontSize = `${sizes[customizerState.size] || 120}px`;
      }

      const sizeLabel = document.getElementById('previewSizeLabel');
      if (sizeLabel) sizeLabel.textContent = customizerState.sizeLabel;

      updateCustomizerPrice();
    });
  }

  // Color selector
  const colorOptions = document.getElementById('colorOptions');
  if (colorOptions) {
    colorOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-btn');
      if (!btn) return;

      colorOptions.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      customizerState.color = btn.dataset.color;
      customizerState.colorBg = btn.dataset.bg;
      customizerState.colorLabel = btn.dataset.label;

      const previewStage = document.getElementById('previewStage');
      if (previewStage) {
        // Generate a nice gradient based on the selected color
        const lighten = (hex) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const mix = (v) => Math.min(255, Math.round(v + (255 - v) * 0.35));
          return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
        };
        previewStage.style.background = `linear-gradient(135deg, ${customizerState.colorBg}, ${lighten(customizerState.colorBg)})`;
      }

      const colorLabel = document.getElementById('previewColorLabel');
      if (colorLabel) colorLabel.textContent = customizerState.colorLabel;

      updateCustomizerPrice();
    });
  }

  // Accessory toggles
  const accessoryOptions = document.getElementById('accessoryOptions');
  if (accessoryOptions) {
    accessoryOptions.addEventListener('change', (e) => {
      if (e.target.type !== 'checkbox') return;

      const name = e.target.dataset.accessory;
      const price = parseInt(e.target.dataset.price, 10);
      const emoji = e.target.dataset.emoji;

      if (e.target.checked) {
        customizerState.accessories.push({ name, price, emoji });
      } else {
        customizerState.accessories = customizerState.accessories.filter((a) => a.name !== name);
      }

      updatePreviewAccessories();
      updateCustomizerPrice();
    });
  }

  function updatePreviewAccessories() {
    const container = document.getElementById('previewAccessories');
    if (!container) return;
    container.innerHTML = '';
    customizerState.accessories.forEach((acc) => {
      const el = document.createElement('div');
      el.className = 'preview-acc-item';
      el.textContent = acc.emoji;
      container.appendChild(el);
    });
  }

  function updateCustomizerPrice() {
    const accTotal = customizerState.accessories.reduce((sum, a) => sum + a.price, 0);
    const total = customizerState.sizePrice + accTotal;

    // Update total price display
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) totalPriceEl.textContent = `₹${total}`;

    const mobileTotalPriceEl = document.getElementById('mobileTotalPrice');
    if (mobileTotalPriceEl) mobileTotalPriceEl.textContent = `₹${total}`;

    // Update breakdown
    const breakdownEl = document.getElementById('summaryBreakdown');
    if (breakdownEl) {
      let html = `<div class="summary-line"><span>${capitalize(customizerState.size)} Teddy</span><span>₹${customizerState.sizePrice}</span></div>`;
      customizerState.accessories.forEach((acc) => {
        html += `<div class="summary-line"><span>${acc.emoji} ${formatName(acc.name)}</span><span>+₹${acc.price}</span></div>`;
      });
      breakdownEl.innerHTML = html;
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatName(name) {
    const names = {
      bow: 'Bow Tie',
      heart: 'Heart Embroidery',
      nametag: 'Name Tag',
      giftbox: 'Gift Box',
      message: 'Message Card',
      bouquet: 'Mini Bouquet',
    };
    return names[name] || name;
  }

  // Customizer WhatsApp order
  const customizerOrderBtn = document.getElementById('customizerOrder');
  const whatsappNumber = '7621907579';

  if (customizerOrderBtn) {
    customizerOrderBtn.addEventListener('click', () => {
      const accTotal = customizerState.accessories.reduce((sum, a) => sum + a.price, 0);
      const total = customizerState.sizePrice + accTotal;

      const accNames = customizerState.accessories.map((a) => `${a.emoji} ${formatName(a.name)}`).join(', ') || 'None';

      const message = `Hello Varsha Teddy Studio! 🧸%0A%0AI'd like to order a custom teddy:%0A%0A📏 Size: ${capitalize(customizerState.size)}%0A🎨 Color: ${customizerState.colorLabel}%0A✨ Extras: ${encodeURIComponent(accNames)}%0A💰 Estimated Total: ₹${total}%0A%0APlease confirm the details and availability!`;

      if (whatsappNumber === 'YOUR_WHATSAPP_NUMBER') {
        showToast('⚠️ WhatsApp number not set yet. Update it in script.js!');
        return;
      }
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank', 'noopener');
    });
  }


  // === 5. STATS COUNTER ANIMATION ===
  const statsSection = document.getElementById('loveStats');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    const numbers = document.querySelectorAll('.stat-number');
    numbers.forEach((el) => {
      const target = parseFloat(el.dataset.target);
      const isDecimal = el.dataset.decimal === 'true';
      const duration = 2000;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        if (isDecimal) {
          el.textContent = current.toFixed(1);
        } else {
          el.textContent = Math.round(current);
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      requestAnimationFrame(update);
    });
  }

  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
        statsObserver.disconnect();
      }
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }


  // === 6. CONTACT FORM (WhatsApp) ===
  const form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get('name')?.trim() || '';
      const type = data.get('type') || '';
      const message = data.get('message')?.trim() || '';
      if (whatsappNumber === 'YOUR_WHATSAPP_NUMBER') {
        showToast('⚠️ Add the WhatsApp number in script.js first.');
        return;
      }
      const text = `Hello Varsha Teddy Studio!%0A%0AName: ${encodeURIComponent(name)}%0ALooking for: ${encodeURIComponent(type)}%0AMessage: ${encodeURIComponent(message)}`;
      window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener');
    });
  }


  // === 7. TOAST NOTIFICATION ===
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }


  // === 8. SMOOTH SCROLL FOR ANCHOR LINKS ===
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 80; // account for fixed nav
        const y = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

})();
