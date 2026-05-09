import Swiper from "swiper";
import "swiper/swiper-bundle.css";
import gsap from "gsap";
import "bootstrap";

document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // HERO ELEMENTS (HOME)
  // =========================
  const hero = document.querySelector(".hero");
  const title = document.querySelector("#hero-title");
  const description = document.querySelector("#hero-description");
  const swiperWrapper = document.querySelector(".swiper-wrapper");

  let swiper;

  // =========================
  // SWIPER INIT (SAFE)
  // =========================
  if (swiperWrapper && hero) {

    swiper = new Swiper(".hero-slider", {
      slidesPerView: 2.3,
      spaceBetween: 10,
      grabCursor: true,
      slidesOffsetAfter: 0,
      pagination: {
        el: ".swiper-pagination",
        type: "fraction",
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        768: { slidesPerView: 2.2, spaceBetween: 32 },
        1200: { slidesPerView: 3.5, spaceBetween: 32 },
      },
    });

  }

  // =========================
  // NAVBAR (SAFE GLOBAL)
  // =========================
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("navbar--scrolled", window.scrollY > 10);
    }, { passive: true });

    const navCollapse = document.getElementById("navMenu");
    if (navCollapse) {
      navCollapse.addEventListener("show.bs.collapse", () => {
        navbar.classList.add("navbar--scrolled");
      });
      navCollapse.addEventListener("hide.bs.collapse", () => {
        if (window.scrollY <= 10) navbar.classList.remove("navbar--scrolled");
      });
    }
  }

  // =========================
  // SLIDE ANIMATION (HOME ONLY)
  // =========================
  let isAnimating = false;

  function setActiveSlide(slide) {
    if (isAnimating || !hero) return;
    isAnimating = true;

    const newImage = slide.querySelector("img").src;
    const newTitle = slide.dataset.title;
    const newDescription = slide.dataset.description;
    const button = document.querySelector("#hero-button");
    const eyebrowGroup = document.querySelector(".hero__eyebrow-group");
    const rect = slide.getBoundingClientRect();
    const OVERLAY = "linear-gradient(rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.35))";
    const taller = slide.dataset.taller;

    const zoomEl = document.createElement("div");

    Object.assign(zoomEl.style, {
      position: "absolute",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      borderRadius: "20px",
      overflow: "hidden",
      zIndex: 0,
      background: `${OVERLAY}, url("${newImage}") center/cover no-repeat`,
    });

    hero.appendChild(zoomEl);

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        isAnimating = false;
      },
    });

    tl.to(slide, {
      duration: 0.35,
      scale: 0.88,
      opacity: 0.5,
    }, 0);

    tl.to(zoomEl, {
      duration: 1,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
    }, 0);

    tl.call(() => {

      if (swiperWrapper) {

        const allSlides = [...swiperWrapper.querySelectorAll(".swiper-slide")];
        gsap.set(allSlides, { clearProps: "scale,opacity,filter" });

        const snapshots = allSlides
          .filter(s => s !== slide)
          .map(s => {
            const r = s.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();
            return {
              src: s.querySelector("img")?.src,
              top: r.top - heroRect.top,
              left: r.left - heroRect.left,
              width: r.width,
              height: r.height,
            };
          });

        gsap.set(swiperWrapper, { opacity: 0 });

        swiperWrapper.appendChild(slide);
        swiper?.update();
        swiper?.slideTo(0, 0);

        const ghosts = snapshots.map(snap => {
          const ghost = document.createElement("div");

          Object.assign(ghost.style, {
            background: `url("${snap.src}") center/cover no-repeat`,
            borderRadius: "1.25rem",
            height: `${snap.height}px`,
            left: `${snap.left}px`,
            pointerEvents: "none",
            position: "absolute",
            top: `${snap.top}px`,
            width: `${snap.width}px`,
            zIndex: 3,
          });

          hero.appendChild(ghost);
          return ghost;
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {

            const heroRect = hero.getBoundingClientRect();
            const newSlides = [...swiperWrapper.querySelectorAll(".swiper-slide")]
              .filter(s => s !== slide);

            ghosts.forEach((ghost, i) => {
              const newRect = newSlides[i]?.getBoundingClientRect();
              if (!newRect) return;

              const targetLeft = newRect.left - heroRect.left;

              gsap.to(ghost, {
                left: targetLeft,
                duration: 1.0,
                ease: "power2.out",
                delay: i * 0.04,
                onComplete: () => {

                  if (i === ghosts.length - 1) {

                    gsap.to(swiperWrapper, {
                      opacity: 1,
                      duration: 0.3,
                      ease: "power1.out",
                    });

                    gsap.to(ghosts, {
                      opacity: 0,
                      duration: 0.3,
                      onComplete: () => ghosts.forEach(g => g.remove()),
                    });
                  }
                },
              });
            });

          });
        });
      }

    }, null, 0.1);

    tl.call(() => {
      hero.style.backgroundImage = `${OVERLAY}, url("${newImage}")`;
      zoomEl.remove();
      gsap.set(slide, { clearProps: "all" });
    }, null, 0.7);

    tl.to([eyebrowGroup, title, description, button], {
      opacity: 0,
      y: -16,
      duration: 0.2,
    }, 0.2);

    tl.call(() => {
      if (title) title.textContent = newTitle;
      if (description) description.textContent = newDescription;
      if (button) {
        button.textContent = slide.dataset.buttonText;
        button.href = `./free.html?taller=${taller}`;
      }
    }, null, 0.35);

    tl.fromTo(
      [eyebrowGroup, title, description, button],
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.14,
      },
      0.4
    );
  }

  // =========================
  // CLICK EVENT (SAFE)
  // =========================
  if (swiperWrapper) {
    swiperWrapper.addEventListener("click", (e) => {
      const slide = e.target.closest(".artisan-card");
      if (slide) setActiveSlide(slide);
    });
  }

  // =========================
  // FREE.HTML PARAM HANDLER (SAFE)
  // =========================
  if (window.location.pathname.includes("free.html")) {

    const params = new URLSearchParams(window.location.search);
    const taller = params.get("taller");

    if (taller) {
      const select = document.getElementById("taller-select");
      const badge = document.getElementById("taller-badge");
      const title = document.getElementById("form-title");

      if (select) select.value = taller;
      if (badge) badge.textContent = `Inscripción: ${taller}`;
      if (title) title.textContent = `Inscripción en ${taller}`;
    }
  }

});