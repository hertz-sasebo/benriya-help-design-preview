/* ============================================================
   便利屋HELP ワイヤーフレーム - 挙動
   1. ハンバーガーメニュー開閉
   2. 料金一覧タブ切り替え
   3. よくある質問アコーディオン
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. ハンバーガーメニュー ---------- */
  var hamburger = document.getElementById('hamburger');
  var gnav = document.getElementById('gnav');

  if (hamburger && gnav) {
    hamburger.addEventListener('click', function () {
      var open = gnav.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });

    // メニュー内リンクをタップしたら閉じる
    gnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        gnav.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. 料金一覧タブ ---------- */
  var tabs = document.querySelectorAll('.price-tab');
  var panels = document.querySelectorAll('.price-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = tab.getAttribute('data-target');

      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });

      panels.forEach(function (panel) {
        var active = panel.id === targetId;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    });
  });

  /* ---------- 2-2. 料金カード詳細の開閉（PC） ---------- */
  var pricesSection = document.querySelector('.prices');
  var priceDetailButtons = document.querySelectorAll('.price-panel__more');

  priceDetailButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = pricesSection.classList.toggle('is-open');
      priceDetailButtons.forEach(function (b) {
        b.setAttribute('aria-expanded', String(open));
      });
    });
  });

  /* ---------- 3. よくある質問アコーディオン ---------- */
  var faqButtons = document.querySelectorAll('.faq-item__q');

  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 4. 追従CTA ----------
     FV を過ぎたら表示し、最終CTAセクションが画面に入ったら非表示。
     IntersectionObserver で判定し、読み込み・復帰・回転時にも再判定する。 */
  var floatingCta = document.getElementById('floatingCta');
  var fv = document.getElementById('fv');
  var finalCta = document.getElementById('cta');

  if (floatingCta && fv && finalCta) {
    var updateFloatingCta = function () {
      var pastFv = fv.getBoundingClientRect().bottom < 80;
      var ctaRect = finalCta.getBoundingClientRect();
      var finalCtaInView = ctaRect.top < window.innerHeight && ctaRect.bottom > 0;
      var visible = pastFv && !finalCtaInView;
      floatingCta.classList.toggle('is-visible', visible);
      floatingCta.setAttribute('aria-hidden', String(!visible));
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(updateFloatingCta).observe(finalCta);
    }

    window.addEventListener('scroll', updateFloatingCta, { passive: true });
    window.addEventListener('resize', updateFloatingCta);
    window.addEventListener('orientationchange', updateFloatingCta);
    window.addEventListener('pageshow', updateFloatingCta);
    window.addEventListener('load', updateFloatingCta);
    updateFloatingCta();
  }

  /* ---------- 5. FVのSCROLL誘導 ----------
     ページ最上部にいる間だけ点滅表示。
     少しでもスクロールしたら即座に非表示にし、
     最上部に戻った時だけ再表示する。 */
  var fvScroll = document.querySelector('.fv__scroll');

  if (fvScroll) {
    var updateFvScroll = function () {
      var atTop = window.pageYOffset <= 0;
      fvScroll.classList.toggle('is-hidden', !atTop);
    };

    window.addEventListener('scroll', updateFvScroll, { passive: true });
    updateFvScroll();
  }
})();
