document.addEventListener('DOMContentLoaded', function () {

    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    let currentIndex = 0;
    let visibleItems = [];

    function getVisibleItems() {
        return Array.from(items).filter(function (item) {
            return !item.classList.contains('hidden');
        });
    }

    /* Filter */
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const filter = btn.getAttribute('data-filter');

            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            items.forEach(function (item) {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    /* Open lightbox */
    items.forEach(function (item) {
        item.addEventListener('click', function () {
            visibleItems = getVisibleItems();
            currentIndex = visibleItems.indexOf(item);
            openLightbox(item);
        });
    });

    function openLightbox(item) {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-item-caption h3');
        const desc = item.querySelector('.gallery-item-caption p');

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title ? title.textContent : '';
        lightboxDesc.textContent = desc ? desc.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showSlide(direction) {
        visibleItems = getVisibleItems();
        currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
        openLightbox(visibleItems[currentIndex]);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', function () { showSlide(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showSlide(1); });

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showSlide(-1);
        if (e.key === 'ArrowRight') showSlide(1);
    });
});
