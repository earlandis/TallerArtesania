import Swiper from "swiper";
import "swiper/swiper-bundle.css";
import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {

  const hero = document.querySelector(".hero");
  const title = document.querySelector("#hero-title");
  const description = document.querySelector("#hero-description");
  const swiperWrapper = document.querySelector(".swiper-wrapper");

  const swiper = new Swiper(".hero-slider", {
    slidesPerView: 2.3,
    spaceBetween: 10,
    grabCursor: true,
    slidesOffsetAfter: 0,
    breakpoints: {
      768: { slidesPerView: 2.2, spaceBetween: 32 },
      1200: { slidesPerView: 3.5, spaceBetween: 32 },
    },
  });

  const navbar = document.querySelector(".navbar");

  if (navbar) {
    // En páginas con scroll: añade clase al bajar
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("navbar--scrolled", window.scrollY > 10);
    }, { passive: true });

    // En home (sin scroll): activa el fondo cuando se abre el menú móvil
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

  let isAnimating = false;

function setActiveSlide(slide) {
  if (isAnimating) return;
  isAnimating = true;

  const newImage = slide.querySelector("img").src;
  const newTitle = slide.dataset.title;
  const newDescription = slide.dataset.description;

  const rect = slide.getBoundingClientRect();
  const OVERLAY = "linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55))";

  // =========================
  // ZOOM LAYER
  // =========================
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
    defaults: {
      ease: "power3.out",
    },
    onComplete: () => {
      isAnimating = false;
    },
  });

  // =========================
  // 1. SLIDE OUT (muy leve)
  // =========================
  tl.to(slide, {
    duration: 0.35,
    scale: 0.88,
    opacity: 0.5,
  }, 0);

  // =========================
  // 2. BACKGROUND MORPH (SIN FADE)
  // =========================
  tl.to(zoomEl, {
    duration: 0.9,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 0,
  }, 0); 

  // =========================
  // 3. SLIDER FLOW
  // =========================
  // =========================
  // 3. SLIDER FLOW
  // =========================
  tl.call(() => {
    // Capturamos snapshot visual de cada slide ANTES de reordenar
    const allSlides = [...swiperWrapper.querySelectorAll(".swiper-slide")];
    const allRealSlides = [...swiperWrapper.querySelectorAll(".swiper-slide")];
    gsap.set(allRealSlides, { clearProps: "scale,opacity,filter" });

    const snapshots = allSlides
      .filter(s => s !== slide) // excluimos el que se va al fondo
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

    // Reordenamos Swiper en silencio (sin que se vea)
    gsap.set(swiperWrapper, { opacity: 0 });
    swiperWrapper.appendChild(slide);
    swiper.update();
    swiper.slideTo(0, 0);

    // Creamos fantasmas que simulan los slides en su posición anterior
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

    // Esperamos un frame para que Swiper calcule las nuevas posiciones
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const heroRect = hero.getBoundingClientRect();
        const newSlides = [...swiperWrapper.querySelectorAll(".swiper-slide")]
          .filter(s => s !== slide);

        // Animamos cada fantasma desde su posición anterior a la nueva
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
      // En el último fantasma hacemos crossfade en lugar de aparición brusca
      if (i === ghosts.length - 1) {
        // Fade in del wrapper real mientras los fantasmas se desvanecen
        gsap.to(swiperWrapper, {
          opacity: 1,
          duration: 0.3,
          ease: "power1.out",
        });

        // Todos los fantasmas se desvanecen a la vez con el wrapper
        gsap.to(ghosts, {
          opacity: 0,
          duration: 0.3,
          ease: "power1.out",
          onComplete: () => ghosts.forEach(g => g.remove()),
        });
      }
    },
  });
});
      });
    });
  }, null, 0.1);

  // =========================
  // 4. BACKGROUND COMMIT (SIN OPACITY CHANGE)
  // =========================
  tl.call(() => {
    hero.style.backgroundImage = `${OVERLAY}, url("${newImage}")`;

    zoomEl.remove();
    gsap.set(slide, { clearProps: "all" });
  }, null, 0.7);

  // =========================
  // 5. TEXT CROSSFADE
  // =========================
  tl.to([title, description], {
    opacity: 0,
    y: -16,
    duration: 0.2,
  }, 0.2);

  tl.call(() => {
    title.textContent = newTitle;
    description.textContent = newDescription;
  }, null, 0.35);

  tl.fromTo(
    [title, description],
    {
      opacity: 0,
      y: 40,        // más abajo
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,        // más lento
      ease: "power2.out",   // desacelera suave — la opacidad sube gradualmente
      stagger: 0.14,        // más separación entre título y descripción
    },
    0.4
  );
}

  // =========================
  // EVENT DELEGATION
  // =========================
  swiperWrapper.addEventListener("click", (e) => {
    const slide = e.target.closest(".artisan-card");
    if (slide) setActiveSlide(slide);
  });

});