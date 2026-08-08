(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {

		if (typeof Swiper === 'undefined') {
			return;
		}

		document.querySelectorAll('.mmi-content-slider').forEach(function (slider) {

			new Swiper(slider, {

				slidesPerView: 4,
				spaceBetween: 24,
				loop: true,
				speed: 900,
				grabCursor: true,
				watchOverflow: true,
				centerInsufficientSlides: true,

				observer: true,
				observeParents: true,
				observeSlideChildren: true,

				preloadImages: false,
				lazy: {
					loadPrevNext: true
				},

				autoplay: {
					delay: 4000,
					disableOnInteraction: false,
					pauseOnMouseEnter: true
				},

				navigation: {
					nextEl: slider.querySelector('.swiper-button-next'),
					prevEl: slider.querySelector('.swiper-button-prev')
				},

				pagination: {
					el: slider.querySelector('.swiper-pagination'),
					clickable: true
				},

				keyboard: {
					enabled: true
				},

				mousewheel: false,

				breakpoints: {

					320: {
						slidesPerView: 1.2,
						spaceBetween: 12
					},

					576: {
						slidesPerView: 2,
						spaceBetween: 16
					},

					768: {
						slidesPerView: 3,
						spaceBetween: 20
					},

					1024: {
						slidesPerView: 4,
						spaceBetween: 24
					}
				}

			});

		});

	});

})();