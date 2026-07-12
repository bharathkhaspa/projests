// Scroll-reveal animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Placeholder links: remind until real URLs are added
document.querySelectorAll("[data-placeholder]").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (el.getAttribute("href") === "#") {
      e.preventDefault();
      alert(
        "Add your real link here!\nOpen index.html and replace href=\"#\" on the '" +
          el.getAttribute("data-placeholder") +
          "' link."
      );
    }
  });
});
