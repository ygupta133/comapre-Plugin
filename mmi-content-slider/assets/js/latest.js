document.addEventListener('DOMContentLoaded', function () {

	if (typeof Swiper === 'undefined') {
		return;
	}

	function syncFeaturedHeight(grid) {
		if (window.innerWidth < 992) {
			var img = grid.querySelector('.mmi-latest-featured-media img');
			if (img) {
				img.style.height = '';
			}
			return;
		}

		var right = grid.querySelector('.mmi-latest-right');
		var img = grid.querySelector('.mmi-latest-featured-media img');
		var content = grid.querySelector('.mmi-latest-featured-content');

		if (!right || !img) {
			return;
		}

		var contentHeight = content ? content.offsetHeight : 0;
		var target = right.offsetHeight - contentHeight - 10;

		if (target > 180) {
			img.style.height = target + 'px';
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
						syncFeaturedHeight(grid);
					}
				},
				slideChange: function () {
					if (grid) {
						window.requestAnimationFrame(function () {
							syncFeaturedHeight(grid);
						});
					}
				}
			}
		});

		if (grid) {
			syncFeaturedHeight(grid);
			window.addEventListener('resize', function () {
				syncFeaturedHeight(grid);
			});
		}

		return swiper;
	});

});
