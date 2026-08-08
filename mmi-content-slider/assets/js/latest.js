document.addEventListener('DOMContentLoaded', function () {

	if (typeof Swiper === 'undefined') {
		return;
	}

	function equalizeColumns(grid) {
		if (window.innerWidth < 992) {
			grid.style.minHeight = '';
			return;
		}

		var left = grid.querySelector('.mmi-latest-featured');
		var right = grid.querySelector('.mmi-latest-right');

		if (!left || !right) {
			return;
		}

		left.style.height = 'auto';
		right.style.height = 'auto';

		var maxHeight = Math.max(left.offsetHeight, right.offsetHeight);

		if (maxHeight > 0) {
			grid.style.minHeight = maxHeight + 'px';
			left.style.height = maxHeight + 'px';
			right.style.height = maxHeight + 'px';
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
						equalizeColumns(grid);
					}
				},
				slideChange: function () {
					if (grid) {
						window.requestAnimationFrame(function () {
							equalizeColumns(grid);
						});
					}
				}
			}
		});

		if (grid) {
			equalizeColumns(grid);
			window.addEventListener('resize', function () {
				equalizeColumns(grid);
			});

			if (typeof ResizeObserver !== 'undefined') {
				var observer = new ResizeObserver(function () {
					equalizeColumns(grid);
				});
				observer.observe(grid);
			}
		}
	});

});
