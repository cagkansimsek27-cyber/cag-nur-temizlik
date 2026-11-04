(function () {
  "use strict";

  var GOOGLE_TAG_ID = "GT-M3V2HXNF";
  var GA4_MEASUREMENT_ID = "G-271LYKZ9B9";

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  // Initialise the Google tag in the recommended order on service pages.
  // The home page already performs this setup in its head.
  if (!window.__cagNurGa4Configured) {
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_TAG_ID);
    window.gtag("config", GA4_MEASUREMENT_ID);
    window.__cagNurGa4Configured = true;
  }

  // Load the same Google tag on pages that do not declare it in the head.
  var tagSelector = 'script[src*="gtag/js?id=' + GOOGLE_TAG_ID + '"]';
  if (!document.querySelector(tagSelector)) {
    var tagScript = document.createElement("script");
    tagScript.async = true;
    tagScript.src = "https://www.googletagmanager.com/gtag/js?id=" + GOOGLE_TAG_ID;
    document.head.appendChild(tagScript);
  }

  function sendLeadEvent(name, params) {
    var payload = Object.assign({
      send_to: GA4_MEASUREMENT_ID,
      event_category: "lead",
      transport_type: "beacon",
      page_path: window.location.pathname
    }, params || {});

    window.gtag("event", name, payload);
  }

  function getAnchor(target) {
    // Clicks on SVG/text children must resolve to the containing link.
    while (target && target !== document) {
      if (target.nodeType === 3) {
        target = target.parentNode;
        continue;
      }
      if (
        target.nodeType === 1 &&
        target.tagName &&
        target.tagName.toLowerCase() === "a" &&
        target.getAttribute("href")
      ) {
        return target;
      }
      target = target.parentNode;
    }
    return null;
  }

  function getSafeLinkUrl(href, isWhatsApp) {
    if (isWhatsApp) {
      // Do not send prefilled message text or query parameters to analytics.
      return href.split("?")[0].split("#")[0];
    }
    return href;
  }

  // Clicks are intent signals: phone_click is not proof that a call connected.
  document.addEventListener("click", function (event) {
    var link = getAnchor(event.target);
    if (!link) return;

    var href = (link.getAttribute("href") || "").trim();
    var label = (link.innerText || link.textContent || "").trim().slice(0, 100);

    if (/^tel:/i.test(href)) {
      sendLeadEvent("phone_click", {
        method: "phone",
        link_url: href,
        link_text: label
      });
      return;
    }

    if (/(wa\.me|api\.whatsapp|whatsapp\.com)/i.test(href)) {
      sendLeadEvent("whatsapp_click", {
        method: "whatsapp",
        link_url: getSafeLinkUrl(href, true),
        link_text: label
      });
    }
  }, true);

  // The homepage quote form builds a WhatsApp link through JavaScript.
  // Count it as a WhatsApp contact start, not as a confirmed customer lead.
  document.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "quoteForm") {
      sendLeadEvent("whatsapp_click", {
        method: "whatsapp_quote_form",
        form_id: "quoteForm",
        link_domain: "wa.me"
      });
      sendLeadEvent("quote_request_opened", {
        method: "whatsapp_quote_form",
        form_id: "quoteForm"
      });
    }
  }, true);
})();