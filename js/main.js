/* Nova Proteção — JavaScript sem framework, dividido por responsabilidade. */
(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];
  const config = window.NOVA_CONFIG;
  const content = window.NOVA_CONTENT;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();

  /** Animação é melhoria progressiva: o site funciona sem Motion. */
  function animate(element, keyframes, options = {}) {
    if (reducedMotion.matches || !window.Motion || !element) return;
    const animation = window.Motion.animate(element, keyframes, {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      ...options,
    });
    animations.add(animation);
    Promise.resolve(animation).then(() => animations.delete(animation));
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
    window
      .matchMedia("(min-width: 1001px)")
      .addEventListener("change", () => setMenu(false));
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
      animate($(".vehicle-copy"), { opacity: [0.6, 1], x: [-8, 0] });
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
    // Pré-carregar só após a página carregar: a imagem principal tem prioridade.
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
        animate($(".shield-center"), { scale: [0.94, 1] });
        animate($(".coverage-detail-copy"), { opacity: [0.6, 1] });
      }),
    );
  }

  function openDialog(dialog) {
    dialog.showModal();
    document.body.classList.add("dialog-open");
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
    // Uma entrada coordenada, sem esconder o conteúdo por CSS.
    animate(
      $(".hero-copy"),
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.85 },
    );
    animate(
      $(".hero-caption"),
      { opacity: [0, 1] },
      { duration: 0.8, delay: 0.3 },
    );
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) {
        animations.forEach((animation) => animation.complete());
        animations.clear();
      }
    });
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
