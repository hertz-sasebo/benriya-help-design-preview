/* ============================================================
   便利屋HELP ワイヤーフレーム - 挙動
   1. ハンバーガーメニュー開閉
   2. 料金一覧タブ切り替え
   3. よくある質問アコーディオン
   4. 追従CTA / 5. FVのSCROLL誘導
   6. 作業実績カルーセル
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

  /* ---------- 6. 作業実績カルーセル ----------
     1ページのボックス数（スマホ2 / 768px以上3）は CSS のグリッドで決まる。
     ここでは矢印・ドットのページ送りと、スワイプ後の現在ページ表示を行い、
     画面幅が変わったら表示中の先頭ボックスを含むページに合わせ直す。 */
  var worksCarousel = document.querySelector('[data-works-carousel]');

  if (worksCarousel) {
    var worksTrack = worksCarousel.querySelector('.work-cards');
    var worksCards = Array.prototype.slice.call(worksTrack.querySelectorAll('.work-card'));
    var worksPrev = worksCarousel.querySelector('.works-carousel__arrow--prev');
    var worksNext = worksCarousel.querySelector('.works-carousel__arrow--next');
    var worksDots = worksCarousel.querySelector('.works-carousel__dots');
    var worksMq = window.matchMedia('(min-width: 768px)');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var perPage = 0;
    var current = 0;
    var firstCard = worksCards[0];

    var visibleCards = function () {
      return worksCards.filter(function (card) { return card.getClientRects().length > 0; });
    };

    // 1ページ分の送り幅（ページ間の gap を含む）
    var pageStep = function () {
      var cards = visibleCards();
      return cards.length > perPage ? cards[perPage].offsetLeft - cards[0].offsetLeft : worksTrack.clientWidth;
    };

    var updateWorks = function () {
      Array.prototype.forEach.call(worksDots.children, function (dot, i) {
        var active = i === current;
        dot.classList.toggle('is-active', active);
        if (active) { dot.setAttribute('aria-current', 'true'); } else { dot.removeAttribute('aria-current'); }
      });
      worksPrev.disabled = current === 0;
      worksNext.disabled = current === worksDots.children.length - 1;
      firstCard = visibleCards()[current * perPage];
    };

    var goTo = function (index, smooth) {
      current = Math.max(0, Math.min(index, worksDots.children.length - 1));
      worksTrack.scrollTo({
        left: current * pageStep(),
        behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto'
      });
      updateWorks();
    };

    var buildWorks = function () {
      var cards = visibleCards();
      perPage = worksMq.matches ? 3 : 2;
      var pages = Math.ceil(cards.length / perPage);

      if (worksDots.children.length !== pages) {
        worksDots.innerHTML = '';
        for (var i = 0; i < pages; i++) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'works-carousel__dot';
          dot.setAttribute('aria-label', (i + 1) + 'ページ目の実績へ');
          worksDots.appendChild(dot);
        }
      }

      // 表示中だった先頭ボックスを含むページを開く（スマホで非表示のボックスなら1ページ目）
      var index = cards.indexOf(firstCard);
      goTo(index < 0 ? 0 : Math.floor(index / perPage), false);
    };

    worksPrev.addEventListener('click', function () { goTo(current - 1, true); });
    worksNext.addEventListener('click', function () { goTo(current + 1, true); });
    worksDots.addEventListener('click', function (e) {
      var dot = e.target.closest('.works-carousel__dot');
      if (dot) { goTo(Array.prototype.indexOf.call(worksDots.children, dot), true); }
    });

    // スワイプ・横スクロールで現在のページを追従
    var worksScrollTimer;
    worksTrack.addEventListener('scroll', function () {
      clearTimeout(worksScrollTimer);
      worksScrollTimer = setTimeout(function () {
        // ブレークポイント切替直後のスクロールは buildWorks に任せる
        if (perPage !== (worksMq.matches ? 3 : 2)) { return; }
        var index = Math.round(worksTrack.scrollLeft / pageStep());
        if (index !== current) {
          current = index;
          updateWorks();
        }
      }, 80);
    }, { passive: true });

    var worksResizeTimer;
    var onWorksResize = function () {
      clearTimeout(worksResizeTimer);
      worksResizeTimer = setTimeout(buildWorks, 120);
    };
    window.addEventListener('resize', onWorksResize);
    window.addEventListener('orientationchange', onWorksResize);

    buildWorks();
    worksCarousel.classList.add('is-ready');
  }
})();
