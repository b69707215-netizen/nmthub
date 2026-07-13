type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function dataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  dataLayer().push({
    event: "nmthub_app_loaded",
    page_path: window.location.pathname,
    page_location: window.location.href,
  });

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (!measurementId?.startsWith("G-")) return;

  window.gtag = window.gtag || ((...args: unknown[]) => dataLayer().push(args));
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_path: window.location.pathname,
    page_location: window.location.href,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  dataLayer().push({
    event,
    ...payload,
  });

  window.gtag?.("event", event, payload);
}
