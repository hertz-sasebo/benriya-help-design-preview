/* ============================================================
   便利屋HELP ワイヤーフレーム - 挙動
   1. ハンバーガーメニュー開閉
   2. 料金一覧タブ切り替え
   3. よくある質問アコーディオン
   4. 追従CTA / 5. FVのSCROLL誘導
   6. 作業実績カルーセル
   7. オープニングローダー
   8. スクロールアニメーション
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
     画面幅が変わったら表示中の先頭ボックスを含むページに合わせ直す。
     3.5秒ごとに自動でページを送る（操作中は停止）。 */
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

    // 自動スワイプ：3.5秒ごとに次のページへ（最後のページの次は1ページ目）。
    // マウスを乗せている間・タッチ中・キーボード操作中は止める。
    // 「視差効果を減らす」設定の端末では自動で動かさない。
    var WORKS_AUTOPLAY_MS = 3500;
    var worksAutoplayTimer = null;
    var worksPause = { hover: false, touch: false, focus: false };

    var startWorksAutoplay = function () {
      clearInterval(worksAutoplayTimer);
      if (worksPause.hover || worksPause.touch || worksPause.focus || reduceMotion.matches) { return; }
      worksAutoplayTimer = setInterval(function () {
        goTo(current >= worksDots.children.length - 1 ? 0 : current + 1, true);
      }, WORKS_AUTOPLAY_MS);
    };
    var setWorksPause = function (reason, value) {
      worksPause[reason] = value;
      startWorksAutoplay();
    };

    worksCarousel.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { setWorksPause('hover', true); }
    });
    worksCarousel.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') { setWorksPause('hover', false); }
    });
    worksCarousel.addEventListener('touchstart', function () { setWorksPause('touch', true); }, { passive: true });
    worksCarousel.addEventListener('touchend', function () { setWorksPause('touch', false); });
    worksCarousel.addEventListener('touchcancel', function () { setWorksPause('touch', false); });
    worksCarousel.addEventListener('focusin', function (e) {
      if (e.target.matches(':focus-visible')) { setWorksPause('focus', true); }
    });
    worksCarousel.addEventListener('focusout', function () { setWorksPause('focus', false); });

    buildWorks();
    worksCarousel.classList.add('is-ready');
    startWorksAutoplay();
  }

  /* ---------- 7. オープニングローダー ----------
     ゲージ（円・2秒）→ 決め台詞（困ったら、HELP。）→ フェードアウト、
     合計4秒前後の演出。ゴリラ画像をゲージの先端に乗せて円周を一周させる。
     参考実装: hertz-sasebo/HOME-PAGE の #loader と同じ仕組み
     （SVG circle の stroke-dasharray/dashoffset を rAF + easeInOutCubic
     で進行させ、カウンターを同期表示）。
     ・同一セッション中の2回目以降はsessionStorageでスキップ
     ・画面タップ/SKIPボタンで即フェードアウト
     ・prefers-reduced-motion: reduce では表示しない ---------- */
  var openingLoader = document.getElementById('openingLoader');

  // ローダーの終了（スキップ・2回目訪問で表示しない時も含む）を FV の登場演出（8.）へ知らせる
  var notifyLoaderDone = function () {
    if (window.helpLoaderDone) { return; }
    window.helpLoaderDone = true;
    document.dispatchEvent(new CustomEvent('help:loader-done'));
  };

  if (!openingLoader) {
    notifyLoaderDone();
  } else {
    var LOADER_SESSION_KEY = 'helpOpeningLoaderShown';
    var loaderReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var loaderAlreadyShown = false;
    try { loaderAlreadyShown = sessionStorage.getItem(LOADER_SESSION_KEY) === '1'; } catch (e) {}

    if (loaderReduceMotion || loaderAlreadyShown) {
      openingLoader.parentNode.removeChild(openingLoader);
      notifyLoaderDone();
    } else {
      try { sessionStorage.setItem(LOADER_SESSION_KEY, '1'); } catch (e) {}

      (function () {
        var ringWrap = document.getElementById('openingLoaderRingWrap');
        var arc      = document.getElementById('openingLoaderArc');
        var mark     = document.getElementById('openingLoaderMark');
        var gorilla  = document.getElementById('openingLoaderGorilla');
        var counter  = document.getElementById('openingLoaderCounter');
        var jpImg    = document.getElementById('openingLoaderJp');
        var helpImg  = document.getElementById('openingLoaderHelp');
        var skipBtn  = document.getElementById('openingLoaderSkip');

        var RADIUS = 42; // SVGのcx/cy/rと一致させる（viewBox 0 0 100 100）
        var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
        arc.style.strokeDasharray = String(CIRCUMFERENCE);
        arc.style.strokeDashoffset = String(CIRCUMFERENCE);

        // ローダー表示中は背面をスクロールさせない
        var htmlEl = document.documentElement;
        var prevHtmlOverflow = htmlEl.style.overflow;
        var prevBodyOverflow = document.body.style.overflow;
        htmlEl.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        function restoreScroll() {
          htmlEl.style.overflow = prevHtmlOverflow;
          document.body.style.overflow = prevBodyOverflow;
        }

        var GAUGE_DURATION = 2000;
        var finished = false;
        var rafId = null;
        var timers = [];
        function setLoaderTimer(fn, delay) {
          var id = setTimeout(fn, delay);
          timers.push(id);
          return id;
        }
        function clearLoaderTimers() {
          timers.forEach(function (id) { clearTimeout(id); });
          timers = [];
        }

        // easeInOutCubic
        function ease(t) {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        // 進捗p(0〜1)から円周上の座標を計算し、ゴリラを正立のまま配置する。
        // 開始位置は12時(-90deg)、時計回りに一周。
        function placeGorilla(p) {
          var size = ringWrap.getBoundingClientRect().width;
          if (!size) { return; }
          var r = size / 2 - 6;
          var angle = (-90 + p * 360) * Math.PI / 180;
          var dx = r * Math.cos(angle);
          var dy = r * Math.sin(angle);
          gorilla.style.transform = 'translate(-50%, -50%) translate(' + dx + 'px, ' + dy + 'px)';
        }
        placeGorilla(0);

        function startGauge() {
          var startTime = null;
          function tick(ts) {
            if (finished) { return; }
            if (!startTime) { startTime = ts; }
            var raw = Math.min((ts - startTime) / GAUGE_DURATION, 1);
            var p = ease(raw);
            arc.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - p));
            counter.textContent = String(Math.floor(p * 100)).padStart(3, '0') + '%';
            placeGorilla(p);
            if (raw < 1) {
              rafId = requestAnimationFrame(tick);
            } else {
              arc.style.strokeDashoffset = '0';
              counter.textContent = '100%';
              placeGorilla(1);
              setLoaderTimer(showCopy, 200);
            }
          }
          rafId = requestAnimationFrame(tick);
        }

        function showCopy() {
          counter.classList.add('is-hidden');
          mark.classList.add('is-lit');
          jpImg.classList.add('is-revealed');
          setLoaderTimer(function () { helpImg.classList.add('is-revealed'); }, 450);
          setLoaderTimer(finish, 450 + 350 + 600);
        }

        function finish() {
          if (finished) { return; }
          finished = true;
          if (rafId) { cancelAnimationFrame(rafId); }
          clearLoaderTimers();
          restoreScroll();
          openingLoader.classList.add('is-done');
          notifyLoaderDone();
          openingLoader.addEventListener('transitionend', removeLoader, { once: true });
          // transitionendが発火しない環境向けの保険
          setTimeout(removeLoader, 900);
        }
        function removeLoader() {
          if (openingLoader.parentNode) { openingLoader.parentNode.removeChild(openingLoader); }
        }

        openingLoader.addEventListener('click', finish);
        skipBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          finish();
        });

        // ゴリラ・決め台詞画像の読み込みを待つ（最大1.5秒）
        var sources = [gorilla.getAttribute('src'), jpImg.getAttribute('src'), helpImg.getAttribute('src')];
        var loadPromises = sources.map(function (src) {
          return new Promise(function (resolve) {
            var img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          });
        });

        Promise.race([
          Promise.all(loadPromises),
          new Promise(function (resolve) { setLoaderTimer(resolve, 1500); })
        ]).then(startGauge);
      })();
    }
  }

  /* ---------- 8. スクロールアニメーション ----------
     .reveal を付けた要素が画面に入ったら .is-visible を付ける（一度表示したら監視をやめる）。
     ・遅延は data-reveal-delay（秒）。親に data-reveal-stagger（秒）があれば、
       子の .reveal に「親の data-reveal-delay ＋ 間隔×順番」を割り当てる
     ・同じセクション内は最初に表示した時刻を基準に順番を保ち、
       後から画面に入った要素は待たせずに表示する
     ・data-reveal-together の中は、その親が画面に入った時点でまとめて表示する
       （お困りごと：項目→ゴリラの順番を守るため / ご依頼の流れ：スマホの横スクロール内も表示するため）
     ・FV（data-reveal-on="loader"）はスクロールではなく、ローダーの終了で表示する
     ・<html> の .js-anim は <head> で付与（視差効果を減らす設定では付かない＝最初から全て表示） */
  var revealRoot = document.documentElement;

  if (revealRoot.classList.contains('js-anim')) {
    var toArray = function (list) { return Array.prototype.slice.call(list); };

    toArray(document.querySelectorAll('[data-reveal-stagger]')).forEach(function (parent) {
      var start = parseFloat(parent.getAttribute('data-reveal-delay')) || 0;
      var step = parseFloat(parent.getAttribute('data-reveal-stagger')) || 0;
      toArray(parent.children).filter(function (child) {
        return child.classList.contains('reveal');
      }).forEach(function (child, i) {
        child.setAttribute('data-reveal-delay', (start + step * i).toFixed(2));
      });
    });

    var revealDelay = function (el) {
      return parseFloat(el.getAttribute('data-reveal-delay')) || 0;
    };

    var showReveal = function (el, wait) {
      el.style.setProperty('--reveal-delay', wait.toFixed(2) + 's');
      el.classList.add('is-visible');
      el.dispatchEvent(new CustomEvent('help:reveal', { detail: { delay: wait } }));
    };

    // 同時に画面に入った要素をセクション単位でまとめて表示する
    var revealGroupStart = [];
    var showRevealBatch = function (els) {
      var now = performance.now();
      var groups = [];
      els.forEach(function (el) {
        var section = el.closest('section') || el;
        var group = groups.filter(function (g) { return g.section === section; })[0];
        if (!group) {
          group = { section: section, items: [] };
          groups.push(group);
        }
        group.items.push(el);
      });

      groups.forEach(function (group) {
        var record = revealGroupStart.filter(function (r) { return r.section === group.section; })[0];
        if (!record) {
          record = { section: group.section, time: now };
          revealGroupStart.push(record);
        }
        var elapsed = (now - record.time) / 1000;
        var first = Math.min.apply(null, group.items.map(revealDelay));
        // 先に表示した要素との順番は保ちつつ、すでに過ぎた分の待ち時間は詰める
        var offset = Math.min(elapsed, first);
        group.items.forEach(function (el) {
          showReveal(el, Math.max(0, revealDelay(el) - offset));
        });
      });
    };

    var revealEls = toArray(document.querySelectorAll('.reveal'));
    var fvRevealEls = revealEls.filter(function (el) { return el.closest('[data-reveal-on="loader"]'); });
    var togetherBoxes = toArray(document.querySelectorAll('[data-reveal-together]'));
    var scrollRevealEls = revealEls.filter(function (el) {
      return fvRevealEls.indexOf(el) < 0 && !el.closest('[data-reveal-together]');
    });
    var revealTargetsOf = function (el) {
      return el.hasAttribute('data-reveal-together') ? toArray(el.querySelectorAll('.reveal')) : [el];
    };

    // 「100件以上」のカウントアップ（カードの表示開始に合わせて 0 → 100、約1.2秒・easeOut）
    toArray(document.querySelectorAll('[data-count-to]')).forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-count-to'), 10);
      var card = counter.closest('.reveal');
      if (!card) { return; }

      card.addEventListener('help:reveal', function (e) {
        // 最終値の幅で固定してから 0 に戻す（数字以外の文字が動かないように）
        counter.style.width = counter.offsetWidth + 'px';
        counter.textContent = '0';
        setTimeout(function () {
          var startTime = null;
          var tick = function (ts) {
            if (!startTime) { startTime = ts; }
            var t = Math.min((ts - startTime) / 1200, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            counter.textContent = String(Math.round(target * eased));
            if (t < 1) {
              requestAnimationFrame(tick);
            } else {
              counter.style.width = '';
            }
          };
          requestAnimationFrame(tick);
        }, e.detail.delay * 1000);
      }, { once: true });
    });

    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        var hits = [];
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          revealObserver.unobserve(entry.target);
          hits = hits.concat(revealTargetsOf(entry.target));
        });
        if (hits.length) { showRevealBatch(hits); }
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

      scrollRevealEls.concat(togetherBoxes).forEach(function (el) { revealObserver.observe(el); });
    } else {
      showRevealBatch(scrollRevealEls.concat.apply(scrollRevealEls, togetherBoxes.map(revealTargetsOf)));
    }

    // FV はローダーの終了を待って表示する
    if (window.helpLoaderDone) {
      showRevealBatch(fvRevealEls);
    } else {
      document.addEventListener('help:loader-done', function () {
        showRevealBatch(fvRevealEls);
      }, { once: true });
    }

    window.helpRevealReady = true;
  }
})();
