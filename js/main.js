/* 高木行政書士事務所 - 共通スクリプト */
document.addEventListener('DOMContentLoaded', function () {

  /* ヘッダーのスクロール影 ＋ ヒーロー上では隠し、スクロールで表示 */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
    header.classList.remove('is-hidden');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* モバイルメニュー（右ドロワー＋暗幕） */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }
    const setMenu = (open) => {
      nav.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      backdrop.classList.toggle('show', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open);
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    backdrop.addEventListener('click', () => setMenu(false));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* スクロールでフェードイン */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* FAQ アコーディオン */
  document.querySelectorAll('.faq-item .faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      item.classList.toggle('open');
    });
  });

  /* 問い合わせフォーム（デモ送信） */
  const form = document.querySelector('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      if (note) {
        note.textContent = 'お問い合わせありがとうございます。これはデモ画面のため、実際には送信されません。本番では送信先メールアドレス等の設定が必要です。';
        note.classList.add('show');
      }
      form.reset();
    });
  }
});

/* 現在開いているページのメニューを強調 (nav-active) */
document.addEventListener('DOMContentLoaded', function () {
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
});

/* スプラッシュ画面の制御 */
document.addEventListener('DOMContentLoaded', function () {
  var splash = document.getElementById('splash');
  if (!splash) return;
  document.body.classList.add('splash-lock');
  function close() {
    splash.classList.add('hide');
    document.body.classList.remove('splash-lock');
  }
  splash.addEventListener('click', close);
  setTimeout(close, 1700);
});

/* ヒーロー画像の自動切り替え（images/hero1.jpg〜hero3.jpg） */
document.addEventListener('DOMContentLoaded', function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-photo .hero-slide'));
  if (slides.length < 2) return;
  var idx = 0;
  setInterval(function () {
    var ready = slides.filter(function (im) {
      return !im.dataset.missing && im.complete && im.naturalWidth > 0;
    });
    if (ready.length < 2) return;
    idx = (idx + 1) % ready.length;
    slides.forEach(function (im) { im.classList.remove('is-active'); });
    ready[idx].classList.add('is-active');
  }, 5000);
});
