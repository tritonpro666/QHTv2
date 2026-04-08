const slides = Array.from(document.querySelectorAll(".slide"));
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const dots = Array.from(document.querySelectorAll(".dot"));
const carousel = document.querySelector(".carousel");
let currentIndex = 0;
let autoPlayId = null;
const AUTO_PLAY_MS = 3500;

function showSlide(index) {
  slides[currentIndex].classList.remove("active");
  slides[currentIndex].classList.remove("show-info");
  dots[currentIndex].classList.remove("active");

  currentIndex = (index + slides.length) % slides.length;
  slides[currentIndex].classList.add("active");
  dots[currentIndex].classList.add("active");
}

function showNext() {
  showSlide(currentIndex + 1);
}

function showPrev() {
  showSlide(currentIndex - 1);
}

nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const target = Number(dot.dataset.index);
    showSlide(target);
  });
});

slides.forEach((slide) => {
  const image = slide.querySelector(".dog-image");
  image.addEventListener("click", () => {
    slide.classList.toggle("show-info");
  });
});

function startAutoPlay() {
  stopAutoPlay();
  autoPlayId = setInterval(showNext, AUTO_PLAY_MS);
}

function stopAutoPlay() {
  if (autoPlayId) {
    clearInterval(autoPlayId);
    autoPlayId = null;
  }
}

carousel.addEventListener("mouseenter", stopAutoPlay);
carousel.addEventListener("mouseleave", startAutoPlay);

startAutoPlay();
