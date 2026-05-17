/**
 * FlowFix — shared UI behavior (navigation, modals, theme, mobile menu, homepage chatbot).
 * Loaded on every page that includes this script after the DOM markup it controls.
 *
 * Sections:
 *  1. Path helpers (theme icons + login links work from /docs/ and /docs/<subfolder>/)
 *  2. Mobile navigation (hamburger)
 *  3. Smooth in-page scrolling for same-page #anchors
 *  4. Button routing map (Figma frame navigation)
 *  5. Light / dark theme toggle + persistence
 *  6. Homepage FlowFix assistant (fab, panel, scripted intake + simple replies)
 */

(function () {
  "use strict";

  /** True when the current file lives inside a folder under docs/ (not docs/index.html at root). */
  function isDeepDocsPage() {
    const path = window.location.pathname || "";
    return /\/docs\/[^/]+\//.test(path);
  }

  /** Prefix for assets shared from docs root (e.g. dark-mode.png). */
  function assetPrefix() {
    return isDeepDocsPage() ? "../" : "";
  }

  /** Absolute-style path to a page under docs/ (e.g. Login/login.html) from any served URL. */
  function hrefFromDocsRoot(relativePath) {
    const path = window.location.pathname || "";
    const marker = "/docs/";
    const idx = path.indexOf(marker);
    if (idx === -1) {
      return relativePath;
    }
    return path.slice(0, idx + marker.length) + relativePath.replace(/^\//, "");
  }

  function initHamburger() {
    const hamburger = document.getElementById("hamburger");
    const altPanel = document.getElementById("navPanel");
    const mainNav = document.querySelector(".main-nav");

    /* Contact / Pricing use #navPanel instead of .main-nav */
    if (hamburger && altPanel) {
      hamburger.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = altPanel.classList.toggle("is-open");
        hamburger.classList.toggle("is-open", open);
        hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      altPanel.querySelectorAll("a, button").forEach(function (el) {
        el.addEventListener("click", function () {
          altPanel.classList.remove("is-open");
          hamburger.classList.remove("is-open");
          hamburger.setAttribute("aria-expanded", "false");
        });
      });
      document.addEventListener("click", function (e) {
        if (!altPanel.classList.contains("is-open")) return;
        const target = e.target;
        if (target instanceof Node && !altPanel.contains(target) && !hamburger.contains(target)) {
          altPanel.classList.remove("is-open");
          hamburger.classList.remove("is-open");
          hamburger.setAttribute("aria-expanded", "false");
        }
      });
      return;
    }

    if (!hamburger || !mainNav) return;

    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      const open = mainNav.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mainNav.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (e) {
      if (!mainNav.classList.contains("is-open")) return;
      const target = e.target;
      if (target instanceof Node && !mainNav.contains(target) && !hamburger.contains(target)) {
        mainNav.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /**
   * Map clickable UI to Figma frame intents without changing layout structure.
   * - Navbar: Home/Services/Location/FAQ/Contact/Log In
   * - Home CTA: GET HELP NOW -> Contact
   * - Emergency button: Contact section
   * - Services cards: Book Now -> Contact
   */
  function initRouteMap() {
    const routesByLabel = {
      home: hrefFromDocsRoot("index.html"),
      services: hrefFromDocsRoot("Pricing/pricing.html"),
      location: hrefFromDocsRoot("Location/Location.html"),
      faq: hrefFromDocsRoot("FAQ/FAQ.html"),
      contact: hrefFromDocsRoot("Pricing/contact.html"),
      "log in": hrefFromDocsRoot("Login/login.html"),
      login: hrefFromDocsRoot("Login/login.html"),
    };

    document.querySelectorAll("a, button").forEach(function (el) {
      const raw = (el.textContent || "").trim().toLowerCase();
      if (!raw) return;
      if (raw in routesByLabel && el.tagName === "A") {
        el.setAttribute("href", routesByLabel[raw]);
      }
    });

    // Home CTA mapping: "GET HELP NOW" goes to Contact page.
    document.querySelectorAll("a, button").forEach(function (el) {
      const label = (el.textContent || "").trim().toLowerCase();
      if (label === "get help now") {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          window.location.href = hrefFromDocsRoot("Pricing/contact.html");
        });
      }
    });

    // Services book buttons route to Contact.
    document.querySelectorAll("a.card-btn, .card button, .service-card a").forEach(function (el) {
      const label = (el.textContent || "").toLowerCase();
      if (label.indexOf("book now") !== -1) {
        el.addEventListener("click", function (e) {
          if (el.tagName !== "A") return;
          // Allow explicit service links to stay intact if already set.
          const href = el.getAttribute("href") || "";
          if (!href || href === "#" || href.indexOf("contact") === -1) {
            e.preventDefault();
            window.location.href = hrefFromDocsRoot("Pricing/contact.html");
          }
        });
      }
    });

    // Emergency action: navigate to contact form section (Figma "scroll/navigate to contact").
    const emergencyBtn = document.getElementById("myBtn");
    if (emergencyBtn) {
      emergencyBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const current = window.location.pathname || "";
        const onContact = /\/Pricing\/contact\.html$/i.test(current);
        if (onContact) {
          const target = document.getElementById("contactForm");
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
        }
        window.location.href = hrefFromDocsRoot("Pricing/contact.html#contactForm");
      });
    }
  }

  function initThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    const stored = localStorage.getItem("flowfix-theme");
    if (stored === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const img = themeToggle.querySelector("img");
    function syncIcon() {
      if (!img) return;
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      img.src = assetPrefix() + (dark ? "light-mode.png" : "dark-mode.png");
      img.alt = dark ? "Switch to light mode" : "Switch to dark mode";
    }
    syncIcon();

    themeToggle.addEventListener("click", function () {
      const html = document.documentElement;
      const isDark = html.getAttribute("data-theme") === "dark";
      if (isDark) {
        html.setAttribute("data-theme", "light");
        localStorage.setItem("flowfix-theme", "light");
      } else {
        html.setAttribute("data-theme", "dark");
        localStorage.setItem("flowfix-theme", "dark");
      }
      syncIcon();
    });
  }

  /**
   * Homepage chatbot: open/close, option chips, free-text steps, mock plumber match,
   * simple keyword replies when not in the guided flow.
   */
  function initFlowfixChatbot() {
    const fab = document.getElementById("ff-fab");
    const panel = document.getElementById("ff-panel");
    const closeBtn = document.getElementById("ff-close");
    const sendBtn = document.getElementById("ff-send");
    const input = document.getElementById("ff-input");
    const messagesEl = document.getElementById("ff-messages");
    if (!fab || !panel || !closeBtn || !sendBtn || !input || !messagesEl) return;

    const SPECIALTIES = [
      "Leak Repair",
      "Pipe Replacement",
      "Drain Cleaning",
      "Water Heater",
      "Toilet Repair",
      "Sewer Line",
      "Emergency Service",
    ];

    const MOCK_PLUMBERS = [
      { name: "Carlos Rivera", specialties: ["Leak Repair", "Pipe Replacement", "Water Heater"], rating: 4.8, eta: "30 mins" },
      { name: "James Okafor", specialties: ["Drain Cleaning", "Sewer Line", "Toilet Repair"], rating: 4.7, eta: "45 mins" },
      { name: "Maria Santos", specialties: ["Water Heater", "Pipe Replacement", "Emergency Service"], rating: 4.9, eta: "20 mins" },
      { name: "Derek Chen", specialties: ["Leak Repair", "Drain Cleaning", "Toilet Repair"], rating: 4.6, eta: "1 hr" },
      { name: "Aisha Thompson", specialties: ["Emergency Service", "Sewer Line", "Pipe Replacement"], rating: 4.9, eta: "15 mins" },
    ];

    const jobData = { jobType: "", description: "", urgency: "", location: "" };
    let step = 0;
    let isLoggedIn = false;
    let waitingForInput = false;
    let flowActive = false;

    try {
      isLoggedIn = !!window.auth?.currentUser;
    } catch (err) {
      /* optional global from Firebase; ignore */
    }

    const steps = [
      { field: "jobType", type: "options", prompt: "What type of job do you need help with?", options: SPECIALTIES },
      { field: "description", type: "text", prompt: "Can you describe the issue in a bit more detail?" },
      {
        field: "urgency",
        type: "options",
        prompt: "How urgent is this?",
        options: ["Low — can wait a few days", "Medium — within 24 hours", "High — as soon as possible"],
      },
      { field: "location", type: "text", prompt: "What's your borough or neighborhood in NYC?" },
    ];

    function scrollBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addBubble(text, side) {
      const wrap = document.createElement("div");
      wrap.className = "ff-bubble-wrap " + side;
      const bubble = document.createElement("div");
      bubble.className = "ff-bubble " + side;
      bubble.textContent = text;
      wrap.appendChild(bubble);
      messagesEl.appendChild(wrap);
      scrollBottom();
    }

    function addOptions(opts, onSelect) {
      const wrap = document.createElement("div");
      wrap.className = "ff-bubble-wrap bot";
      const div = document.createElement("div");
      div.className = "ff-options";
      opts.forEach(function (o) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ff-opt-btn";
        btn.textContent = o;
        btn.addEventListener("click", function () {
          div.querySelectorAll(".ff-opt-btn").forEach(function (b) {
            b.disabled = true;
          });
          onSelect(o);
        });
        div.appendChild(btn);
      });
      wrap.appendChild(div);
      messagesEl.appendChild(wrap);
      scrollBottom();
    }

    function showTyping() {
      const wrap = document.createElement("div");
      wrap.className = "ff-bubble-wrap bot";
      wrap.id = "ff-typing-wrap";
      const bubble = document.createElement("div");
      bubble.className = "ff-bubble bot";
      bubble.innerHTML = '<div class="ff-typing"><span></span><span></span><span></span></div>';
      wrap.appendChild(bubble);
      messagesEl.appendChild(wrap);
      scrollBottom();
    }

    function removeTyping() {
      const t = document.getElementById("ff-typing-wrap");
      if (t) t.remove();
    }

    function botSay(text, delay, afterFn) {
      return new Promise(function (res) {
        showTyping();
        setTimeout(function () {
          removeTyping();
          addBubble(text, "bot");
          if (afterFn) afterFn();
          res();
        }, delay || 600);
      });
    }

   function findMatch(jobType) {
      const matched = MOCK_PLUMBERS.filter(function (p) {
        return p.specialties.indexOf(jobType) !== -1;
      });
      return matched.length > 0 ? matched[0] : MOCK_PLUMBERS[0];
    }

 function showMatchCard(plumber) {
  const card = document.createElement("div");
  card.className = "ff-match-card";
  card.innerHTML =
    '<div class="ff-mc-name">' + plumber.name + "</div>" +
    '<div class="ff-mc-detail">Specialty: ' + plumber.specialties[0] + "</div>" +
    '<div class="ff-mc-detail">Rating: ' + plumber.rating + " / 5</div>" +
    '<div class="ff-mc-detail">ETA: ' + plumber.eta + "</div>" +
    (plumber.reason ? '<div class="ff-mc-detail" style="margin-top:6px;font-style:italic;color:#1e3a5f;">' + plumber.reason + '</div>' : '') +
    '<span class="ff-mc-badge">Best Match</span>';
  const wrap = document.createElement("div");
  wrap.className = "ff-bubble-wrap bot";
  wrap.appendChild(card);
  messagesEl.appendChild(wrap);
  scrollBottom();
}

    function showSignupPrompt() {
      const card = document.createElement("div");
      card.className = "ff-signup-prompt";
      card.innerHTML =
        "<p>Create a free account to confirm your booking and get real-time updates from your plumber.</p>";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ff-signup-btn";
      btn.textContent = "Sign up to confirm";
      btn.addEventListener("click", function () {
        window.location.href = hrefFromDocsRoot("Login/login.html");
      });
      card.appendChild(btn);
      const wrap = document.createElement("div");
      wrap.className = "ff-bubble-wrap bot";
      wrap.appendChild(card);
      messagesEl.appendChild(wrap);
      scrollBottom();
    }

    function keywordReply(text) {
      const lower = text.toLowerCase();
      if (/price|cost|how much/.test(lower)) {
        return "Pricing starts by service — open the Pricing page for packages, or tell me the job type and I can point you to the right tier.";
      }
      if (/hours|when|available/.test(lower)) {
        return "We route emergency jobs 24/7. Standard visits are typically Mon–Sat, 8am–6pm local time.";
      }
      if (/hello|hi |hey/.test(lower)) {
        return "Hi there! Tell me what’s going on with your plumbing, or tap a specialty to get started.";
      }
      return (
        "Thanks for the details. If you’re mid-booking, finish the questions above. Otherwise try asking about pricing, hours, or describe the leak or clog."
      );
    }

    async function handleAnswer(answer) {
      const currentStep = steps[step];
      jobData[currentStep.field] = answer.replace(/ — .+/, "");
      addBubble(answer, "user");
      step++;

      if (step < steps.length) {
        await botSay(steps[step].prompt, 700);
        if (steps[step].type === "options") {
          addOptions(steps[step].options, handleAnswer);
          waitingForInput = false;
        } else {
          waitingForInput = true;
        }
      } else {
        await finishFlow();
      }
    }

async function finishFlow() {
  waitingForInput = false;
  await botSay("Finding your best match, give me just a moment!", 800);
  showTyping();

  let plumber;
  try {
    const GEMINI_KEY = "%%GEMINI_KEY%%";
    const prompt = `You are a plumber-matching assistant for FlowFix, a NYC-based plumbing platform.
Given the job details and plumbers list, return ONLY valid JSON with no additional/extra text.
Shape: { "name": "...", "specialties": ["..."], "rating": 4.9, "eta": "...", "reason": "one sentence why" }
Job:
- Type: ${jobData.jobType}
- Description: ${jobData.description}
- Urgency: ${jobData.urgency}
- Location: ${jobData.location}
Plumbers:
${JSON.stringify(MOCK_PLUMBERS, null, 2)}
Return only the JSON.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text.trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    plumber = JSON.parse(cleaned);
  } catch (err) {
    console.error("matchPlumber error:", err);
    plumber = findMatch(jobData.jobType);
  }

  removeTyping();
  await botSay("We found a great match for your " + jobData.jobType + " job!", 100);
  showMatchCard(plumber);

  if (isLoggedIn) {
    await botSay(plumber.name + " has been notified and will be on their way soon!", 1000);
  } else {
    await botSay("To confirm this booking, you'll need a free FlowFix account.", 1000);
    showSignupPrompt();
  }
  flowActive = false;
}

    async function startFlow() {
      messagesEl.innerHTML = "";
      step = 0;
      Object.keys(jobData).forEach(function (k) {
        jobData[k] = "";
      });
      flowActive = true;

      await botSay("Hi! I'm your FlowFix assistant. I'll help match you with the right plumber.", 400);
      await botSay("Are you a returning user or a guest today?", 800, function () {
        addOptions(["I have an account", "I'm a guest"], async function (choice) {
          addBubble(choice, "user");
          if (choice === "I have an account") {
            isLoggedIn = true;
            await botSay("Welcome back! Let's get you sorted.", 600);
          } else {
            isLoggedIn = false;
            await botSay("No problem! I can still find you a match. You'll just need to sign up to confirm.", 700);
          }
          await botSay(steps[0].prompt, 700);
          addOptions(steps[0].options, handleAnswer);
          waitingForInput = false;
        });
      });
    }

    fab.addEventListener("click", function () {
      const open = panel.classList.toggle("open");
      fab.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && messagesEl.children.length === 0) {
        startFlow();
      }
    });

    closeBtn.addEventListener("click", function () {
      panel.classList.remove("open");
      fab.setAttribute("aria-expanded", "false");
    });

    function sendText() {
      const val = input.value.trim();
      if (!val) return;
      input.value = "";
      if (waitingForInput) {
        handleAnswer(val);
        return;
      }
      if (!flowActive) {
        addBubble(val, "user");
        addBubble(keywordReply(val), "bot");
      }
    }

    sendBtn.addEventListener("click", sendText);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") sendText();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHamburger();
    initSmoothScroll();
    initRouteMap();
    initThemeToggle();
    initFlowfixChatbot();
  });
})();
