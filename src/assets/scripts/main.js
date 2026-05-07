import Swiper from "swiper";
import "swiper/swiper-bundle.css";

document.addEventListener("DOMContentLoaded", () => {

  const hero = document.querySelector(".hero");
  const title = document.querySelector("#hero-title");
  const description = document.querySelector("#hero-description");
  const swiperWrapper = document.querySelector(".swiper-wrapper");

  const swiper = new Swiper(".hero-slider", {
    slidesPerView: 1.2,
    spaceBetween: 16,
    grabCursor: true,

    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 24,
      },

      1200: {
        slidesPerView: 2.3,
      }
    }
  });

  function setActiveSlide(slide) {

    const newTitle = slide.dataset.title;
    const newDescription = slide.dataset.description;
    const newImage = slide.querySelector("img").src;

    title.textContent = newTitle;
    description.textContent = newDescription;

    hero.style.backgroundImage =
      `linear-gradient(rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.6)), url("${newImage}")`;

    swiperWrapper.appendChild(slide);
    swiper.update();
    swiper.slideTo(0);
  }

  document.querySelectorAll(".artisan-card").forEach(slide => {
    slide.addEventListener("click", () => setActiveSlide(slide));
  });

});