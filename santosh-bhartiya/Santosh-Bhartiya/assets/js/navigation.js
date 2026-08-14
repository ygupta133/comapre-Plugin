const menuBtn = document.querySelector(".menu-btn");

const mobileMenu = document.querySelector(".mobile-menu");

const closeBtn = document.querySelector(".close-menu");

menuBtn.addEventListener("click", () => {

    mobileMenu.classList.add("active");

});

closeBtn.addEventListener("click", () => {

    mobileMenu.classList.remove("active");

});