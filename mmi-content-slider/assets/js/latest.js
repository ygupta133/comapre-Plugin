document.addEventListener('DOMContentLoaded', function () {

	if (typeof Swiper === 'undefined') {
		return;
	}

	document.querySelectorAll('.mmi-latest-right').forEach(function (wrapper) {
		var slider = wrapper.querySelector('.mmi-latest-slider');

		if (!slider) {
			return;
		}

		var prevBtn = wrapper.querySelector('.mmi-latest-arrow-prev');
		var nextBtn = wrapper.querySelector('.mmi-latest-arrow-next');
		var slideCount = slider.querySelectorAll('.swiper-slide').length;

		new Swiper(slider, {
			slidesPerView: 1,
			spaceBetween: 0,
			loop: slideCount > 1,
			speed: 500,
			autoHeight: false,
			navigation: (prevBtn && nextBtn) ? {
				nextEl: nextBtn,
				prevEl: prevBtn
			} : false
		});
	});

});
