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
     FV を過ぎたら透過 → フェード表示。
     よくある質問の末尾を画面下部が通過したらフェードで非表示。 */
  var floatingCta = document.getElementById('floatingCta');
  var fv = document.getElementById('fv');
  var faq = document.getElementById('faq');

  if (floatingCta && fv && faq) {
    var updateFloatingCta = function () {
      var scrollY = window.pageYOffset;
      var viewportBottom = scrollY + window.innerHeight;

      var pastFirstView = scrollY > (fv.offsetTop + fv.offsetHeight - 80);
      var faqBottom = faq.offsetTop + faq.offsetHeight;
      var passedFaqEnd = viewportBottom > faqBottom;

      var visible = pastFirstView && !passedFaqEnd;
      floatingCta.classList.toggle('is-visible', visible);
      floatingCta.setAttribute('aria-hidden', String(!visible));
    };

    window.addEventListener('scroll', updateFloatingCta, { passive: true });
    window.addEventListener('resize', updateFloatingCta);
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
