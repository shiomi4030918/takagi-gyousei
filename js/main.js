/* 高木行政書士事務所 - 共通スクリプト */
document.addEventListener('DOMContentLoaded', function () {

  /* ヘッダーのスクロール影 */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* モバイルメニュー */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
    }));
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
