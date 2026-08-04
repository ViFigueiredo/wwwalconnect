/* ==========================================================================
   Alconnect Tecnologia — Interações (vanilla JS, zero dependências)
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------ */
  /* Header: sombra/apertada ao rolar                                    */
  /* ------------------------------------------------------------------ */
  var header = document.getElementById("header");

  function handleScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  document.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ------------------------------------------------------------------ */
  /* Menu mobile (hambúrguer)                                            */
  /* ------------------------------------------------------------------ */
  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("mainNav");

  function setMenu(open) {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
    mainNav.classList.toggle("is-open", open);
  }

  menuToggle.addEventListener("click", function () {
    var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  // Fechar menu ao clicar em um link
  mainNav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      setMenu(false);
    }
  });

  // Fechar com tecla Esc
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  // Fechar ao clicar fora (onclick válido para teclado/pointer)
  document.addEventListener("click", function (event) {
    if (
      mainNav.classList.contains("is-open") &&
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  // Reabrir hambúrguer ao redimensionar p/ desktop
  window.matchMedia("(min-width: 768px)").addEventListener("change", function (e) {
    if (e.matches) {
      setMenu(false);
    }
  });

  /* ------------------------------------------------------------------ */
  /* Contadores animados (IntersectionObserver)                          */
  /* ------------------------------------------------------------------ */
  var counters = Array.prototype.slice.call(
    document.querySelectorAll(".number__value[data-count]")
  );

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = prefersReducedMotion ? 0 : 1600;
    var start = null;

    function step(timestamp) {
      if (start === null) {
        start = timestamp;
      }
      var progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.round(target * progress) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    if (duration === 0) {
      el.textContent = target + suffix;
      return;
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    // Fallback: só mostra valor final
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute("data-count") || "0") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Link ativo do menu conforme seção visível (IntersectionObserver)    */
  /* ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('a[href^="#"]')
  );
  var sections = Array.prototype.slice
    .call(document.querySelectorAll("main section[id]"))
    .map(function (section) {
      return section;
    });

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      if (link.hash === "#" + id) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Validação do formulário de contato (vanilla)                        */
  /* ------------------------------------------------------------------ */
  var form = document.getElementById("contactForm");
  if (form) {
    var inputs = {
      nome: {
        el: document.getElementById("nome"),
        error: document.getElementById("error-nome"),
        validate: function (value) {
          return value.trim().length >= 2 ? "" : "Informe seu nome completo.";
        },
      },
      empresa: {
        el: document.getElementById("empresa"),
        error: document.getElementById("error-empresa"),
        validate: function (value) {
          return value.trim().length >= 2 ? "" : "Informe o nome da sua empresa.";
        },
      },
      email: {
        el: document.getElementById("email"),
        error: document.getElementById("error-email"),
        validate: function (value) {
          var v = value.trim();
          if (!v) {
            return "Informe seu e-mail corporativo.";
          }
          var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!re.test(v)) {
            return "Informe um e-mail válido (ex.: nome@empresa.com).";
          }
          return "";
        },
      },
      telefone: {
        el: document.getElementById("telefone"),
        error: document.getElementById("error-telefone"),
        validate: function (value) {
          var digits = value.replace(/\D/g, "");
          if (digits.length < 10) {
            return "Informe um telefone válido com DDD.";
          }
          return "";
        },
      },
      mensagem: {
        el: document.getElementById("mensagem"),
        error: document.getElementById("error-mensagem"),
        validate: function (value) {
          return value.trim().length >= 10
            ? ""
            : "Escreva uma mensagem com pelo menos 10 caracteres.";
        },
      },
    };

    var formSuccess = document.getElementById("formSuccess");

    function setFieldError(field, message) {
      field.error.textContent = message;
      field.el.classList.toggle("is-invalid", Boolean(message));
      field.el.setAttribute(
        "aria-invalid",
        message ? "true" : "false"
      );
    }

    function validateField(field) {
      var message = field.validate(field.el.value);
      setFieldError(field, message);
      return !message;
    }

    // Validação em tempo real após o primeiro erro
    Object.keys(inputs).forEach(function (key) {
      var field = inputs[key];
      field.el.addEventListener("blur", function () {
        validateField(field);
      });
      field.el.addEventListener("input", function () {
        if (field.el.classList.contains("is-invalid")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      formSuccess.hidden = true;

      var allValid = true;
      var firstInvalid = null;
      Object.keys(inputs).forEach(function (key) {
        var field = inputs[key];
        var valid = validateField(field);
        if (!valid) {
          allValid = false;
          if (!firstInvalid) {
            firstInvalid = field.el;
          }
        }
      });

      if (allValid) {
        formSuccess.hidden = false;
        form.reset();
        // limpa indicadores visuais
        Object.keys(inputs).forEach(function (key) {
          setFieldError(inputs[key], "");
        });
        formSuccess.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
      } else if (firstInvalid) {
        firstInvalid.focus();
      }
    });
  }
})();