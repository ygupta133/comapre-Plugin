document.addEventListener('DOMContentLoaded', function () {

	if (typeof Swiper === 'undefined') {
		return;
	}

	document.querySelectorAll('.mmi-latest-right').forEach(function (wrapper) {
		var slider = wrapper.querySelector('.mmi-latest-slider');
		if (!slider) {
			return;
		}

		var nav = wrapper.querySelector('.mmi-latest-navigation');
		var slideCount = slider.querySelectorAll('.swiper-slide').length;

		new Swiper(slider, {
			slidesPerView: 1,
			spaceBetween: 0,
			loop: slideCount > 1,
			speed: 600,
			autoHeight: false,
			navigation: nav ? {
				nextEl: nav.querySelector('.swiper-button-next'),
				prevEl: nav.querySelector('.swiper-button-prev')
			} : false
		});
	});

});
