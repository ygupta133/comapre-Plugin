document.addEventListener('DOMContentLoaded', function () {

	if (typeof Swiper === 'undefined') {
		return;
	}

	document.querySelectorAll('.mmi-latest-desktop .mmi-latest-grid').forEach(function (slider) {
		var nav = slider.querySelector('.mmi-latest-navigation');

		new Swiper(slider, {
			slidesPerView: 1,
			spaceBetween: 0,
			loop: slider.querySelectorAll('.swiper-slide').length > 1,
			speed: 600,
			autoHeight: true,
			navigation: nav ? {
				nextEl: nav.querySelector('.swiper-button-next'),
				prevEl: nav.querySelector('.swiper-button-prev')
			} : false
		});
	});

	document.querySelectorAll('.mmi-latest-mobile').forEach(function (slider) {
		var nav = slider.querySelector('.mmi-latest-mobile-nav');

		new Swiper(slider, {
			slidesPerView: 1,
			spaceBetween: 12,
			loop: slider.querySelectorAll('.swiper-slide').length > 1,
			speed: 500,
			autoplay: {
				delay: 4500,
				disableOnInteraction: false
			},
			navigation: nav ? {
				nextEl: nav.querySelector('.swiper-button-next'),
				prevEl: nav.querySelector('.swiper-button-prev')
			} : false
		});
	});

});
