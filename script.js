const menu = document.querySelector("#nav-menu");
const menuToggle = document.querySelector(".nav__toggle");
const themeToggle = document.querySelector(".theme-toggle");
const typedRole = document.querySelector("#typed-role");

const setTheme = (isDark) => {
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.setAttribute("aria-label", isDark ? "เปิดโหมดสว่าง" : "เปิดโหมดมืด");
  themeToggle.innerHTML = isDark
    ? '<i class="ri-sun-line" aria-hidden="true"></i>'
    : '<i class="ri-moon-line" aria-hidden="true"></i>';
};

const savedTheme = localStorage.getItem("portfolio-theme");
setTheme(savedTheme === "dark");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "เปิดเมนู" : "ปิดเมนู");
  menuToggle.innerHTML = isExpanded
    ? '<i class="ri-menu-line" aria-hidden="true"></i>'
    : '<i class="ri-close-line" aria-hidden="true"></i>';
  menu.classList.toggle("show-menu", !isExpanded);
});

menu.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("show-menu");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "เปิดเมนู");
    menuToggle.innerHTML = '<i class="ri-menu-line" aria-hidden="true"></i>';
  });
});

themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark-theme");
  setTheme(isDark);
  localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      document.querySelectorAll(".nav__link").forEach((link) => {
        link.classList.toggle(
          "active-link",
          link.getAttribute("href") === `#${entry.target.id}`,
        );
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" },
);

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (typedRole) {
  const roles = typedRole.dataset.roles.split("|");
  const graphemeSegmenter =
    typeof Intl.Segmenter === "function"
      ? new Intl.Segmenter("th", { granularity: "grapheme" })
      : null;

  if (prefersReducedMotion || !graphemeSegmenter) {
    typedRole.textContent = roles[0];
  } else {
    const roleParts = roles.map((role) =>
      Array.from(graphemeSegmenter.segment(role), ({ segment }) => segment),
    );
    let roleIndex = 0;
    let characterIndex = roleParts[0].length;
    let deleting = false;

    const typeRole = () => {
      const currentRole = roleParts[roleIndex];
      typedRole.textContent = currentRole.slice(0, characterIndex).join("");
      let delay = deleting ? 55 : 95;

      if (!deleting && characterIndex === currentRole.length) {
        deleting = true;
        delay = 1400;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      } else {
        characterIndex += deleting ? -1 : 1;
      }

      window.setTimeout(typeRole, delay);
    };

    window.setTimeout(typeRole, 1400);
  }
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealElements = document.querySelectorAll(
    ".hero__content, .hero__image-wrap, .section-heading, .about__content, .skill-card, .project-card, .contact__intro, .contact__channels",
  );
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
  document.documentElement.classList.add("motion-ready");

  document.querySelectorAll(".skill-card").forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
  });
  document.querySelectorAll(".project-card").forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${index * 110}ms`);
  });
}
