// box slider effect for the features section
$(document).ready(function () {
    $("#parent").bxSlider({
        slideWidth: 400,
        slideMargin: 5,
        speed: 2000,
        pagerType: 'short'
    });


    // selects the tags from html file
    let menu = document.querySelector("#menu-icon");
    let navbar = document.querySelector(".navbar");

    // once the menu icon is clicked, navbar shows, else remove.
    menu.addEventListener("click", function () {
        navbar.classList.toggle("active");
    });

    window.onscroll = () => {
        navbar.classList.remove("active");
    };
});