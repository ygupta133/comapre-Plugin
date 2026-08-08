(function () {
  'use strict';

  function initDesktopHero(root) {
    var slides = root.querySelectorAll('.mmi-hero-slide');
    if (!slides.length) return;

    var current = 0;
    var prevBtn = root.querySelector('.mmi-hero-prev');
    var nextBtn = root.querySelector('.mmi-hero-next');
    var timer = null;
    var delay = 5000;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function prev() {
      show(current - 1);
    }

    function startTimer() {
      stopTimer();
      if (slides.length > 1) {
        timer = window.setInterval(next, delay);
      }
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prev();
        startTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        next();
        startTimer();
      });
    }

    root.addEventListener('mouseenter', stopTimer);
    root.addEventListener('mouseleave', startTimer);

    show(0);
    startTimer();
  }

  function initMobileHero(root) {
    if (typeof window.Swiper === 'undefined') return;

    var el = root.querySelector('.mmi-hero-mobile');
    if (!el) return;

    var swiper = new window.Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 12,
      loop: true,
      speed: 450,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: root.querySelector('.mmi-hero-mobile-next'),
        prevEl: root.querySelector('.mmi-hero-mobile-prev'),
      },
    });

    return swiper;
  }

  function init() {
    document.querySelectorAll('.mmi-hero').forEach(function (root) {
      initDesktopHero(root);
      initMobileHero(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
