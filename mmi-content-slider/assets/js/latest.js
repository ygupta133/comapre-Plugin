document.addEventListener('DOMContentLoaded', function () {

	if (typeof Swiper === 'undefined') {
		return;
	}

	function syncColumnHeights(grid) {
		if (window.innerWidth < 992) {
			var media = grid.querySelector('.mmi-latest-featured-media');
			if (media) {
				media.style.minHeight = '';
			}
			return;
		}

		var right = grid.querySelector('.mmi-latest-right');
		var media = grid.querySelector('.mmi-latest-featured-media');
		var content = grid.querySelector('.mmi-latest-featured-content');

		if (!right || !media) {
			return;
		}

		var textHeight = content ? content.offsetHeight : 0;
		var imageHeight = right.offsetHeight - textHeight - 12;

		if (imageHeight > 160) {
			media.style.minHeight = imageHeight + 'px';
		}
	}

	document.querySelectorAll('.mmi-latest-right').forEach(function (wrapper) {
		var grid = wrapper.closest('.mmi-latest-grid');
		var slider = wrapper.querySelector('.mmi-latest-slider');

		if (!slider) {
			return;
		}

		var prevBtn = wrapper.querySelector('.mmi-latest-arrow-prev');
		var nextBtn = wrapper.querySelector('.mmi-latest-arrow-next');
		var slideCount = slider.querySelectorAll('.swiper-slide').length;

		var swiper = new Swiper(slider, {
			slidesPerView: 1,
			spaceBetween: 0,
			loop: slideCount > 1,
			speed: 500,
			autoHeight: false,
			navigation: (prevBtn && nextBtn) ? {
				nextEl: nextBtn,
				prevEl: prevBtn
			} : false,
			on: {
				init: function () {
					if (grid) {
						syncColumnHeights(grid);
					}
				},
				slideChange: function () {
					if (grid) {
						window.requestAnimationFrame(function () {
							syncColumnHeights(grid);
						});
					}
				}
			}
		});

		if (grid) {
			syncColumnHeights(grid);
			window.addEventListener('resize', function () {
				syncColumnHeights(grid);
			});
		}

		return swiper;
	});

});
