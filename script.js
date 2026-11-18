const menu = document.querySelector("#nav-menu");
const menuToggle = document.querySelector(".nav__toggle");
const themeToggle = document.querySelector(".theme-toggle");
const siteFeedback = document.querySelector("#site-feedback");

let feedbackTimer;

const showFeedback = (message, isError = false) => {
  siteFeedback.textContent = message;
  siteFeedback.classList.toggle("site-feedback--error", isError);
  siteFeedback.classList.add("site-feedback--visible");
  window.clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    siteFeedback.classList.remove("site-feedback--visible");
  }, 2800);
};

const setTheme = (isDark) => {
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "โหมดมืด ON สลับเป็นโหมดสว่าง" : "โหมดสว่าง OFF สลับเป็นโหมดมืด",
  );
  themeToggle.innerHTML = isDark
    ? '<i class="ri-sun-line" aria-hidden="true"></i><span class="theme-toggle__label">DARK</span><strong class="theme-toggle__status">ON</strong>'
    : '<i class="ri-moon-line" aria-hidden="true"></i><span class="theme-toggle__label">LIGHT</span><strong class="theme-toggle__status">OFF</strong>';
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

document.querySelectorAll(".skill-card").forEach((card) => {
  const skill = card.querySelector(".skill-card__info h3").textContent.trim();
  const learnLink = card.querySelector(".skill-card__learn");
  const query = encodeURIComponent(`${skill} คืออะไร ความสำคัญ`);
  learnLink.href = `https://www.google.com/search?q=${query}`;
  learnLink.setAttribute("aria-label", `ค้นหาข้อมูลเบื้องต้นและความสำคัญของ${skill}บน Google`);
});

const projectCards = document.querySelectorAll(".project-card");
const projectFilters = document.querySelectorAll(".projects__filter");
const projectDialog = document.querySelector(".project-dialog");
const dialogImage = projectDialog.querySelector(".project-dialog__image");
const dialogVisual = projectDialog.querySelector(".project-dialog__visual");
const dialogVideo = projectDialog.querySelector(".project-dialog__video");

const setProjectCategory = (category) => {
  projectFilters.forEach((filter) => {
    const isActive = filter.dataset.projectFilter === category;
    filter.classList.toggle("is-active", isActive);
    filter.setAttribute("aria-pressed", String(isActive));
  });
  projectCards.forEach((card) => {
    card.hidden = card.dataset.projectCategory !== category;
  });
};

projectFilters.forEach((filter) => {
  filter.addEventListener("click", () => setProjectCategory(filter.dataset.projectFilter));
});
setProjectCategory("activities");

const openProjectDetails = (card) => {
  const title = card.dataset.projectTitle;
  projectDialog.querySelector(".project-dialog__type").textContent = card.dataset.projectType || "";
  projectDialog.querySelector("#project-dialog-title").textContent = title;
  projectDialog.querySelector(".project-dialog__description").textContent =
    card.dataset.projectDescription || "เตรียมเพิ่มรายละเอียดผลงาน";

  if (card.dataset.projectImage) {
    dialogImage.src = card.dataset.projectImage;
    dialogImage.alt = title;
    dialogImage.hidden = false;
    dialogVisual.classList.remove("is-empty");
  } else {
    dialogImage.removeAttribute("src");
    dialogImage.alt = "";
    dialogImage.hidden = true;
    dialogVisual.classList.add("is-empty");
  }

  if (card.dataset.projectVideo) {
    dialogVideo.href = card.dataset.projectVideo;
    dialogVideo.hidden = false;
  } else {
    dialogVideo.removeAttribute("href");
    dialogVideo.hidden = true;
  }

  projectDialog.showModal();
};

projectCards.forEach((card) => {
  card.addEventListener("click", () => openProjectDetails(card));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openProjectDetails(card);
  });
});

projectDialog.querySelector(".project-dialog__close").addEventListener("click", () => {
  projectDialog.close();
});
projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

const emailButton = document.querySelector("[data-copy-email]");
emailButton.addEventListener("click", async () => {
  const email = emailButton.dataset.copyEmail;
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = email;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand("copy");
    temporaryInput.remove();
    if (!copied) {
      showFeedback("คัดลอกอีเมลไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง", true);
      return;
    }
  }

  emailButton.classList.add("is-copied");
  showFeedback("คัดลอกอีเมลแล้ว");
  window.setTimeout(() => emailButton.classList.remove("is-copied"), 1800);
});

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
