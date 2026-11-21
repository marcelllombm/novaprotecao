/* Nova Proteção — JavaScript com GSAP, ScrollTrigger, MotionPath e Three.js 3D. */
(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];
  const config = window.NOVA_CONFIG;
  const content = window.NOVA_CONTENT;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasGsap = () => Boolean(window.gsap);

  function onMediaChange(mq, handler) {
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  function initNavigation() {
    const toggle = $(".menu-toggle");
    const navigation = $(".main-nav");
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      navigation.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () =>
      setMenu(toggle.getAttribute("aria-expanded") !== "true"),
    );
    $$("a", navigation).forEach((link) =>
      link.addEventListener("click", () => setMenu(false)),
    );
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) setMenu(false);
    });
    navigation.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!$(".site-header").contains(document.activeElement)) setMenu(false);
      });
    });
    onMediaChange(window.matchMedia("(min-width: 1001px)"), () =>
      setMenu(false),
    );
  }

  function chooseQuoteVehicle(type) {
    const radio = $(`input[name="vehicle"][value="${type}"]`);
    if (!radio) return;
    radio.checked = true;
    $("#model").placeholder = content.vehicles[type].placeholder;
  }

  function initVehicleSelector() {
    const tabs = $$("[data-vehicle]");
    const panel = $("#vehicle-panel");
    function selectVehicle(type) {
      const vehicle = content.vehicles[type];
      tabs.forEach((tab) => {
        const active = tab.dataset.vehicle === type;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle("is-active", active);
      });
      panel.setAttribute("aria-labelledby", `tab-${type}`);
      panel.dataset.vehicle = type;
      const title = $("#vehicle-title");
      title.replaceChildren(
        document.createTextNode(vehicle.title[0]),
        document.createElement("br"),
        document.createTextNode(vehicle.title[1]),
      );
      $("#vehicle-description").textContent = vehicle.description;
      $("#vehicle-icon use").setAttribute("href", `#i-${vehicle.icon}`);
      $("#vehicle-image").src = vehicle.image;
      $("#vehicle-image").alt = vehicle.imageAlt;
      const link = $("#vehicle-quote");
      link.firstChild.textContent = `${vehicle.action} `;
      link.dataset.quoteVehicle = type;
      chooseQuoteVehicle(type);

      if (hasGsap()) {
        const tl = window.gsap.timeline({
          defaults: { ease: "power3.out", overwrite: "auto" },
        });
        tl.fromTo(
          ".vehicle-copy .icon-tile",
          { scale: 0.78, rotate: -10, opacity: 0.4 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.42, ease: "back.out(1.7)" },
          0,
        )
          .fromTo(
            ["#vehicle-title", "#vehicle-description", "#vehicle-quote"],
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.42, stagger: 0.05 },
            0.04,
          )
          .fromTo(
            ".vehicle-copy .check-list li",
            { opacity: 0, x: -12 },
            { opacity: 1, x: 0, duration: 0.34, stagger: 0.05 },
            0.12,
          )
          .fromTo(
            "#vehicle-image",
            { scale: 1.09, opacity: 0.5 },
            { scale: 1.03, opacity: 1, duration: 0.55, ease: "power2.out" },
            0,
          );
      }
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectVehicle(tab.dataset.vehicle));
      tab.addEventListener("keydown", (event) => {
        let target;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft")
          target = tabs[(index + 1) % tabs.length];
        if (event.key === "Home") target = tabs[0];
        if (event.key === "End") target = tabs[tabs.length - 1];
        if (!target) return;
        event.preventDefault();
        selectVehicle(target.dataset.vehicle);
        target.focus();
      });
    });
    $$("[data-quote-vehicle]").forEach((link) =>
      link.addEventListener("click", () =>
        chooseQuoteVehicle(link.dataset.quoteVehicle),
      ),
    );
    $$("input[name='vehicle']").forEach((input) =>
      input.addEventListener("change", () => chooseQuoteVehicle(input.value)),
    );
    window.addEventListener("load", () => {
      const image = new Image();
      image.src = content.vehicles.moto.image;
    });
  }

  function initCoverages() {
    const buttons = $$("[data-coverage]");
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        const coverage = content.coverages[button.dataset.coverage];
        buttons.forEach((item) => {
          const active = item === button;
          item.setAttribute("aria-pressed", String(active));
          item.classList.toggle("is-active", active);
        });
        $("#coverage-title").textContent = coverage.title;
        $("#coverage-description").textContent = coverage.description;
        $("#coverage-icon use").setAttribute("href", `#i-${coverage.icon}`);

        if (hasGsap()) {
          const tl = window.gsap.timeline({
            defaults: { overwrite: "auto" },
          });
          tl.fromTo(
            ".shield-center",
            { scale: 0.78, rotate: -16 },
            {
              scale: 1,
              rotate: -7,
              duration: 0.48,
              ease: "back.out(1.9)",
            },
            0,
          )
            .fromTo(
              ".orbit-one",
              { scale: 0.88, opacity: 0.4 },
              { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
              0,
            )
            .fromTo(
              ".coverage-detail-copy > *",
              { opacity: 0, y: 14 },
              {
                opacity: 1,
                y: 0,
                duration: 0.38,
                stagger: 0.055,
                ease: "power3.out",
              },
              0.04,
            );
        }
      }),
    );
  }

  function openDialog(dialog) {
    dialog.showModal();
    document.body.classList.add("dialog-open");
    if (hasGsap()) {
      window.gsap.fromTo(
        dialog,
        { opacity: 0, y: 22, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: "power3.out" },
      );
    }
  }

  function initDialogs() {
    $$("dialog").forEach((dialog) => {
      $$("[data-close-dialog]", dialog).forEach((button) =>
        button.addEventListener("click", () => dialog.close()),
      );
      dialog.addEventListener("close", () =>
        document.body.classList.remove("dialog-open"),
      );
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          dialog.close();
      });
    });
    $("[data-open-privacy]").addEventListener("click", () =>
      openDialog($("#privacy-dialog")),
    );
  }

  function getWhatsAppNumber() {
    const rawNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
    const number = /^\d{10,11}$/.test(rawNumber) ? `55${rawNumber}` : rawNumber;
    return /^55\d{10,11}$/.test(number) ? number : "";
  }

  function initWhatsAppFloat() {
    const button = $("#whatsapp-float");
    if (!button) return;
    const number = getWhatsAppNumber();
    if (!number) {
      button.hidden = true;
      button.removeAttribute("href");
      return;
    }
    const text = `Olá, ${config.brandName}! Gostaria de uma cotação de proteção veicular.`;
    button.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    button.hidden = false;
  }

  function initQuoteForm() {
    const form = $("#quote-form");
    const errorSummary = $("#form-errors");
    const messages = {
      name: "Informe seu nome com pelo menos 2 caracteres.",
      phone: "Informe seu celular com DDD.",
      model: "Informe o modelo e o ano do veículo.",
      city: "Informe sua cidade e seu estado.",
    };

    function normalizePhoneDigits(value) {
      let digits = value.replace(/\D/g, "");
      if (digits.length >= 12 && digits.startsWith("55")) {
        digits = digits.slice(2);
      }
      return digits.slice(0, 11);
    }

    function formatPhone(value) {
      const digits = normalizePhoneDigits(value);
      if (!digits) return "";
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      }
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    function validateField(input) {
      const value = input.value.trim();
      const invalid =
        input.id === "phone"
          ? !/^\d{10,11}$/.test(normalizePhoneDigits(value))
          : value.length < (input.id === "name" ? 2 : 3);
      input.setAttribute("aria-invalid", String(invalid));
      $(`#${input.id}-error`).textContent = invalid ? messages[input.id] : "";
      return !invalid;
    }

    $$(".form-field input", form).forEach((input) => {
      input.addEventListener("input", () => {
        if (input.id === "phone") {
          input.value = formatPhone(input.value);
        }
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
        errorSummary.hidden = true;
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalidFields = $$(".form-field input", form).filter(
        (input) => !validateField(input),
      );
      if (invalidFields.length) {
        const title = document.createElement("strong");
        title.textContent = "Falta pouco. Confira estes campos:";
        const list = document.createElement("ul");
        invalidFields.forEach((input) => {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = `#${input.id}`;
          link.textContent = messages[input.id];
          link.addEventListener("click", () => input.focus());
          item.append(link);
          list.append(item);
        });
        errorSummary.replaceChildren(title, list);
        errorSummary.hidden = false;
        errorSummary.focus();

        // Padrão Motion Design: Error Shake firme sem overshoot (320ms).
        if (hasGsap()) {
          window.gsap.fromTo(
            invalidFields,
            { x: 0 },
            {
              keyframes: [
                { x: -8, duration: 0.06 },
                { x: 8, duration: 0.07 },
                { x: -5, duration: 0.07 },
                { x: 5, duration: 0.06 },
                { x: 0, duration: 0.06 },
              ],
              ease: "power2.inOut",
              overwrite: "auto",
            },
          );
        }
        return;
      }
      errorSummary.hidden = true;
      const values = new FormData(form);
      const message = [
        `Olá, ${config.brandName}! Gostaria de uma cotação de proteção veicular.`,
        "",
        `Nome: ${values.get("name").trim()}`,
        `Celular: ${formatPhone(values.get("phone"))}`,
        `Veículo: ${values.get("vehicle") === "moto" ? "Moto" : "Carro"}`,
        `Modelo e ano: ${values.get("model").trim()}`,
        `Cidade/UF: ${values.get("city").trim()}`,
        "",
        "Quero conhecer os valores, as proteções disponíveis e as condições de adesão.",
      ].join("\n");
      $("#quote-summary").value = message;
      $("#copy-status").textContent = "";
      const number = getWhatsAppNumber();
      const available = Boolean(number);
      const whatsapp = $("#whatsapp-send");
      whatsapp.hidden = !available;
      if (available) {
        whatsapp.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        $("#contact-status").textContent =
          "Continue no WhatsApp para conversar com a Nova. A mensagem só será enviada quando você confirmar no aplicativo.";
      } else {
        whatsapp.removeAttribute("href");
        $("#contact-status").textContent =
          "O contato direto da Nova ainda não está disponível nesta página. Copie ou baixe seu pedido para encaminhar à equipe. Nenhuma informação foi enviada.";
      }
      openDialog($("#quote-dialog"));
    });

    $("#copy-quote").addEventListener("click", async () => {
      const summary = $("#quote-summary");
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(summary.value);
        $("#copy-status").textContent =
          "Pedido copiado. Agora você pode compartilhá-lo.";
      } catch {
        summary.focus();
        summary.select();
        $("#copy-status").textContent =
          "Selecionei seu pedido. Use a opção Copiar do seu dispositivo, Ctrl+C ou ⌘C.";
      }
    });
    $("#download-quote").addEventListener("click", () => {
      const url = URL.createObjectURL(
        new Blob([$("#quote-summary").value], {
          type: "text/plain;charset=utf-8",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "pedido-cotacao-nova-protecao.txt";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  function initMotion() {
    const hero3dStage = $("#hero-3d-stage");
    let hero3d = null;
    try {
      hero3d = window.NOVA_HERO_3D
        ? window.NOVA_HERO_3D.init(hero3dStage, {
            reducedMotion: reducedMotion.matches,
          })
        : null;
    } catch {
      hero3d = null;
    }

    onMediaChange(reducedMotion, () => {
      hero3d?.setReducedMotion(reducedMotion.matches);
    });

    if (!window.gsap || !window.ScrollTrigger) return;
    const { gsap, ScrollTrigger, MotionPathPlugin } = window;
    gsap.registerPlugin(
      ScrollTrigger,
      ...(MotionPathPlugin ? [MotionPathPlugin] : []),
    );
    // Essencial no iOS Safari: evita recálculos enquanto a barra de endereço retrai.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();

    // Modo suave (quando "Reduzir Movimento" está ativado no iOS/sistema):
    // mantém transições gentis de opacidade sem movimentos bruscos ou parallax.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      ScrollTrigger.create({
        start: 40,
        end: "max",
        onToggle: (self) =>
          $(".site-header")?.classList.toggle("is-scrolled", self.isActive),
      });

      gsap.to("#scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15,
        },
      });

      gsap.from(".hero-copy > *, .hero-3d-stage", {
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });

      const counterEl = $("#hours-counter");
      if (counterEl) {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: 24,
          duration: 1.0,
          ease: "power2.out",
          snap: { value: 1 },
          scrollTrigger: {
            trigger: ".hours-mark",
            start: "top 90%",
            once: true,
          },
          onUpdate: () => {
            counterEl.textContent = String(Math.round(counter.value));
          },
        });
      }

      ScrollTrigger.batch(
        ".strip-inner > div, .vehicle-panel, .coverage-option, .coverage-detail, .steps li, .quote-form, .faq-list details, .closing-inner",
        {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, {
              opacity: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: "power2.out",
              overwrite: true,
            }),
        },
      );
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 0. Cabeçalho reativo + barra de progresso de leitura.
      ScrollTrigger.create({
        start: 40,
        end: "max",
        onToggle: (self) =>
          $(".site-header")?.classList.toggle("is-scrolled", self.isActive),
      });

      gsap.to("#scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15,
        },
      });

      // 1. HERO — Coreografia cinematográfica de entrada (3 camadas de movimento).
      const heroTl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      heroTl
        .from(".hero-media", {
          scale: 1.09,
          duration: 1.35,
          ease: "power2.out",
        }, 0)
        .from(".hero-glow", {
          scale: 0.72,
          opacity: 0,
          duration: 1.15,
          ease: "power2.out",
        }, 0.05)
        .from(".hero-intro", {
          y: 18,
          opacity: 0,
          duration: 0.55,
        }, 0.1)
        .from(".hero-line-inner", {
          y: 34,
          opacity: 0,
          duration: 0.78,
          stagger: 0.13,
          ease: "power3.out",
        }, 0.18)
        .from(".hero-description", {
          y: 22,
          opacity: 0,
          duration: 0.65,
        }, 0.44)
        .from(".hero-actions > *", {
          y: 20,
          opacity: 0,
          scale: 0.95,
          duration: 0.55,
          stagger: 0.1,
          ease: "back.out(1.35)",
        }, 0.56)
        .from(".hero-note", {
          y: 14,
          opacity: 0,
          duration: 0.5,
        }, 0.7)
        .from(".hero-3d-stage", {
          scale: 0.8,
          opacity: 0,
          y: 20,
          duration: 0.95,
          ease: "power3.out",
        }, 0.25)
        .from(".caption-line", {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 0.55,
        }, 0.68)
        .from(".hero-caption > span:last-child", {
          x: -14,
          opacity: 0,
          duration: 0.55,
        }, 0.78)
        .from(".scroll-cue", {
          y: -12,
          opacity: 0,
          duration: 0.5,
        }, 0.88);

      // Flutuação ambiente suave no indicador de rolagem.
      gsap.to(".scroll-cue .icon", {
        y: 6,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Respiração sutil do halo atmosférico (visível também no mobile/iOS).
      gsap.to(".hero-glow", {
        scale: 1.08,
        opacity: 0.8,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 1B. HERO — Parallax multicamada vinculado ao scroll (BG + Copy + 3D).
      const heroParallax = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.75,
          invalidateOnRefresh: true,
          onUpdate: (self) => hero3d?.setScroll(self.progress),
        },
      });

      heroParallax
        .fromTo(
          ".hero-image",
          { yPercent: -10, scale: 1.22 },
          { yPercent: 18, scale: 1.32, ease: "none" },
          0,
        )
        .to(".hero-copy", { y: -44, opacity: 0.2, ease: "none" }, 0)
        .to(".hero-caption", { y: -74, opacity: 0, ease: "none" }, 0)
        .to(".scroll-cue", { y: 18, opacity: 0, ease: "none" }, 0);

      // 1C. HERO — Parallax interativo por mouse em desktop (gsap.quickTo 60fps).
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const hero = $(".hero");
        const bgX = gsap.quickTo(".hero-image", "x", { duration: 0.7, ease: "power3.out" });
        const bgY = gsap.quickTo(".hero-image", "y", { duration: 0.7, ease: "power3.out" });
        const glowX = gsap.quickTo(".hero-glow", "x", { duration: 0.9, ease: "power3.out" });
        const glowY = gsap.quickTo(".hero-glow", "y", { duration: 0.9, ease: "power3.out" });

        hero.addEventListener("pointermove", (event) => {
          const rect = hero.getBoundingClientRect();
          const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
          bgX(-nx * 14);
          bgY(-ny * 9);
          glowX(nx * 24);
          glowY(ny * 16);
          hero3d?.setPointer(nx, ny);
        });

        hero.addEventListener("pointerleave", () => {
          bgX(0);
          bgY(0);
          glowX(0);
          glowY(0);
          hero3d?.setPointer(0, 0);
        });

        const heroCta = $(".hero-actions .button-primary");
        heroCta?.addEventListener("mouseenter", () => hero3d?.setBoost(true));
        heroCta?.addEventListener("mouseleave", () => hero3d?.setBoost(false));
      }

      // 2. Faixa de serviços (entrada escalonada + pop dos ícones).
      const stripTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".service-strip",
          start: "top 92%",
          once: true,
        },
      });
      stripTl
        .from(".strip-inner > div", {
          y: 26,
          opacity: 0,
          duration: 0.55,
          stagger: 0.11,
          ease: "power3.out",
        })
        .from(".strip-inner > div > .icon", {
          scale: 0.65,
          rotate: -12,
          duration: 0.5,
          stagger: 0.11,
          ease: "back.out(1.9)",
        }, 0.08);

      // 3. Seção de veículos (Carro / Moto + parallax suave na fotografia).
      gsap.from(".vehicle-heading > *, .vehicle-tabs", {
        y: 26,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".vehicle-section",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".vehicle-panel", {
        y: 36,
        opacity: 0,
        scale: 0.98,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".vehicle-panel",
          start: "top 90%",
          once: true,
        },
      });

      gsap.fromTo(
        "#vehicle-image",
        { yPercent: -6, scale: 1.09 },
        {
          yPercent: 6,
          scale: 1.09,
          ease: "none",
          scrollTrigger: {
            trigger: ".vehicle-photo",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );

      // 4. Seção de proteções (opções + escudo flutuante + órbitas contínuas).
      gsap.from("#coberturas .section-heading > *", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#coberturas",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".coverage-option", {
        x: -24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".coverage-options",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".coverage-detail", {
        y: 32,
        opacity: 0,
        scale: 0.97,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".coverage-detail",
          start: "top 90%",
          once: true,
        },
      });

      // Camada ambiente contínua nas órbitas e escudo de coberturas.
      gsap.to(".shield-center", {
        y: -7,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".orbit-one", {
        scale: 1.04,
        opacity: 0.65,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".orbit-two", {
        scale: 0.96,
        opacity: 0.55,
        duration: 4.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".dot-one", {
        y: -14,
        x: 10,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".dot-two", {
        y: 12,
        x: -12,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 5. Assistência 24h — Contador 0→24 + fluxo da estrada + guincho no trajeto SVG.
      gsap.from(".assistance-copy > *", {
        y: 26,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#assistencia",
          start: "top 88%",
          once: true,
        },
      });

      const counterEl = $("#hours-counter");
      if (counterEl) {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: 24,
          duration: 1.25,
          ease: "power2.out",
          snap: { value: 1 },
          scrollTrigger: {
            trigger: ".hours-mark",
            start: "top 88%",
            once: true,
          },
          onUpdate: () => {
            counterEl.textContent = String(Math.round(counter.value));
          },
        });
      }

      gsap.from(".hours-unit", {
        y: 22,
        opacity: 0,
        scale: 0.85,
        duration: 0.7,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: ".hours-mark",
          start: "top 88%",
          once: true,
        },
      });

      gsap.to(".route-dash", {
        strokeDashoffset: -34,
        duration: 1.1,
        repeat: -1,
        ease: "none",
      });

      if (MotionPathPlugin && $("#assistance-route-path") && $(".route-truck")) {
        try {
          gsap.set(".route-truck", {
            rotation: 0,
            transformOrigin: "50% 50%",
          });
          gsap.to(".route-truck", {
            motionPath: {
              path: "#assistance-route-path",
              align: "#assistance-route-path",
              alignOrigin: [0.5, 0.5],
              autoRotate: true,
              start: 0.08,
              end: 0.78,
            },
            immediateRender: true,
            ease: "none",
            scrollTrigger: {
              trigger: ".assistance-section",
              start: "top 80%",
              end: "bottom 25%",
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
          });
        } catch {
          // Mantém posição padrão caso o navegador não suporte alinhamento SVG.
        }
      }

      // 6. Cotação — Passos numerados + entrada do formulário.
      gsap.from(".quote-copy > h2, .quote-copy > p", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#cotacao",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".steps li", {
        x: -22,
        opacity: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steps",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".step-number", {
        scale: 0.6,
        duration: 0.5,
        stagger: 0.12,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: ".steps",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".quote-form", {
        y: 40,
        opacity: 0,
        scale: 0.98,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".quote-form",
          start: "top 90%",
          once: true,
        },
      });

      // 7. Perguntas frequentes (entrada em lote via ScrollTrigger.batch).
      gsap.from("#duvidas .faq-layout > div:first-child > *", {
        y: 22,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#duvidas",
          start: "top 88%",
          once: true,
        },
      });

      ScrollTrigger.batch(".faq-list details", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 22,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
            overwrite: true,
          }),
      });

      $$(".faq-list details").forEach((details) => {
        details.addEventListener("toggle", () => {
          if (details.open) {
            gsap.fromTo(
              $(".faq-answer", details),
              { opacity: 0, y: -8 },
              { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
            );
          }
        });
      });

      // 8. Encerramento (arco decorativo em parallax + chamada final).
      gsap.to(".closing-road", {
        rotation: -18,
        y: 55,
        ease: "none",
        scrollTrigger: {
          trigger: ".closing-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.from(".closing-inner > *", {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".closing-section",
          start: "top 88%",
          once: true,
        },
      });

      // 9. Botão flutuante de WhatsApp (entrada elástica suave após a hero).
      const floatBtn = $("#whatsapp-float");
      if (floatBtn && !floatBtn.hidden) {
        gsap.from(floatBtn, {
          scale: 0.65,
          y: 24,
          opacity: 0,
          duration: 0.6,
          delay: 1.05,
          ease: "back.out(1.8)",
        });
      }
    });

    // Atualiza posições dos gatilhos após fontes e imagens carregarem.
    window.addEventListener("load", () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  $("#current-year").textContent = new Date().getFullYear();
  initNavigation();
  initVehicleSelector();
  initCoverages();
  initDialogs();
  initWhatsAppFloat();
  initQuoteForm();
  // Sem JavaScript, o formulário não deve enviar dados por uma requisição GET.
  $(".form-submit").disabled = false;
  initMotion();
})();
