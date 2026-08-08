document.addEventListener('DOMContentLoaded', function () {

	if (typeof Swiper === 'undefined') {
		return;
	}

	function equalizeColumns(grid) {
		if (window.innerWidth < 992) {
			grid.style.minHeight = '';
			var featured = grid.querySelector('.mmi-latest-featured');
			var right = grid.querySelector('.mmi-latest-right');
			if (featured) {
				featured.style.height = '';
			}
			if (right) {
				right.style.height = '';
			}
			return;
		}

		var left = grid.querySelector('.mmi-latest-featured');
		var right = grid.querySelector('.mmi-latest-right');

		if (!left || !right) {
			return;
		}

		left.style.height = 'auto';
		right.style.height = 'auto';
		grid.style.minHeight = '';

		var rightHeight = right.offsetHeight;

		if (rightHeight > 0) {
			left.style.height = rightHeight + 'px';
			right.style.height = rightHeight + 'px';
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
			var images = grid.querySelectorAll('img');
			var pendingImages = 0;

			images.forEach(function (img) {
				if (!img.complete) {
					pendingImages += 1;
					img.addEventListener('load', function onImageLoad() {
						img.removeEventListener('load', onImageLoad);
						pendingImages -= 1;
						if (pendingImages <= 0) {
							equalizeColumns(grid);
						}
					});
				}
			});

			equalizeColumns(grid);

			window.addEventListener('resize', function () {
				equalizeColumns(grid);
			});

			if (typeof ResizeObserver !== 'undefined') {
				var observer = new ResizeObserver(function () {
					equalizeColumns(grid);
				});
				observer.observe(wrapper);
			}
		}
	});

});
