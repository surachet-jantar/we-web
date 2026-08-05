const swiper = new Swiper(".mySlider", {
    loop: true,
    speed: 1200,
    effect: "fade",
    // เพิ่มคำสั่งนี้เพื่อแก้ปัญหาเนื้อหาซ้อนกันตอน Fade
    fadeEffect: {
        crossFade: true
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});
