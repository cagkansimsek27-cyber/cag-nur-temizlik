(function () {
  "use strict";
  var TAG_ID = "GT-M3V2HXNF";
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  // Load the existing Google tag on service pages that did not previously have it.
  var tagSelector = 'script[src*="gtag/js?id=' + TAG_ID + '"]';
  if (!document.querySelector(tagSelector)) {
    var tagScript = document.createElement("script");
    tagScript.async = true;
    tagScript.src = "https://www.googletagmanager.com/gtag/js?id=" + TAG_ID;
    document.head.appendChild(tagScript);
    window.gtag("js", new Date());
    window.gtag("config", TAG_ID);
  }

  function sendLeadEvent(name, params) {
    var payload = Object.assign({
      event_category: "lead",
      transport_type: "beacon"
    }, params || {});
    window.gtag("event", name, payload);
  }

  function getAnchor(target) {
    while (target && target !== document) {
      if (target.tagName && target.tagName.toLowerCase() === "a" && target.getAttribute("href")) return target;
      target = target.parentNode;
    }
    return null;
  }

  // A phone-link click is a click signal, not proof that a call was completed.
  document.addEventListener("click", function (event) {
    var link = getAnchor(event.target);
    if (!link) return;
    var href = (link.getAttribute("href") || "").trim();
    var label = (link.innerText || link.textContent || "").trim().slice(0, 100);
    if (/^tel:/i.test(href)) {
      sendLeadEvent("phone_click", { method: "phone", link_url: href, link_text: label });
    } else if (/(wa\.me|api\.whatsapp|whatsapp\.com)/i.test(href)) {
      sendLeadEvent("whatsapp_click", { method: "whatsapp", link_url: href, link_text: label });
    }
  }, true);

  // The quote form opens WhatsApp using JavaScript rather than a normal anchor.
  document.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "quoteForm") {
      sendLeadEvent("whatsapp_click", { method: "whatsapp_quote_form", form_id: "quoteForm" });
      sendLeadEvent("generate_lead", { method: "whatsapp_quote_form", form_id: "quoteForm" });
    }
  }, true);
})();