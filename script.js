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

const storeValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    showFeedback("บันทึกข้อมูลไม่สำเร็จ พื้นที่จัดเก็บของเบราว์เซอร์อาจเต็ม", true);
    return false;
  }
};

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

const setUploadedImage = (image, icon, dataUrl) => {
  image.src = dataUrl;
  image.hidden = false;
  image.dataset.savedImage = dataUrl;
  icon.hidden = true;
};

const optimizeImage = (file, onReady) => {
  if (!file.type.startsWith("image/")) {
    showFeedback("กรุณาเลือกไฟล์รูปภาพ", true);
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showFeedback("ไฟล์รูปมีขนาดใหญ่เกินไป (สูงสุด 8 MB)", true);
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => showFeedback("อ่านไฟล์รูปไม่สำเร็จ กรุณาลองอีกครั้ง", true);
  reader.onload = () => {
    const source = new Image();
    source.onerror = () => showFeedback("เปิดไฟล์รูปไม่สำเร็จ กรุณาเลือกไฟล์อื่น", true);
    source.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(source.naturalWidth, source.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(source.naturalWidth * scale);
      canvas.height = Math.round(source.naturalHeight * scale);
      canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/webp", 0.8);

      if (dataUrl.length > 2_000_000) {
        showFeedback("รูปหลังปรับขนาดยังใหญ่เกินไป กรุณาเลือกไฟล์ที่เล็กลง", true);
        return;
      }
      onReady(dataUrl);
    };
    source.src = reader.result;
  };
  reader.readAsDataURL(file);
};

document.querySelectorAll(".project-card").forEach((card) => {
  const projectId = card.dataset.project;
  const image = card.querySelector(".project-card__image");
  const icon = card.querySelector(".project-card__visual > i");
  const fields = card.querySelectorAll("[contenteditable='true']");
  const storageKey = `portfolio-project-${projectId}`;
  let savedProject;

  try {
    savedProject = JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    showFeedback(`ไม่สามารถอ่านข้อมูลผลงาน ${projectId} ที่บันทึกไว้ได้`, true);
  }

  if (savedProject && typeof savedProject === "object") {
    if (Array.isArray(savedProject.text)) {
      fields.forEach((field, index) => {
        if (typeof savedProject.text[index] === "string") {
          field.textContent = savedProject.text[index];
        }
      });
    }
    if (typeof savedProject.image === "string" && savedProject.image) {
      setUploadedImage(image, icon, savedProject.image);
    }
  }

  const saveProject = () => {
    const projectData = {
      text: Array.from(fields, (field) => field.textContent),
      image: image.dataset.savedImage || "",
    };
    return storeValue(storageKey, JSON.stringify(projectData));
  };

  fields.forEach((field) => field.addEventListener("input", saveProject));
  card.querySelector(".project-image-upload").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;

    optimizeImage(file, (dataUrl) => {
      setUploadedImage(image, icon, dataUrl);
      if (saveProject()) {
        showFeedback("เพิ่มรูปผลงานแล้ว");
      }
    });
    event.target.value = "";
  });
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
