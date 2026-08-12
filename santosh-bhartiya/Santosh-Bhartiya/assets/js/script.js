const cards = document.querySelectorAll(".historic-card");
const loadMoreBtn = document.querySelector(".load-more-btn");

cards.forEach((card, index) => {
    if (index >= 4) {
        card.style.display = "none";
    }
});

let currentItems = 4;

loadMoreBtn.addEventListener("click", () => {

    for (let i = currentItems; i < currentItems + 4; i++) {
        if (cards[i]) {
            cards[i].style.display = "block";
        }
    }

    currentItems += 4;

    if (currentItems >= cards.length) {
        loadMoreBtn.style.display = "none";
    }

});