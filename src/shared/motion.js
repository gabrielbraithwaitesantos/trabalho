const pageExitDuration = 260;
const pageEnterDuration = 360;
const homeSplashImpactDuration = 1500;
const routeTransitionStorageKey = "dudas:route-transition";

let linkTransitionsBound = false;
let revealObserver;
let leavingPage = false;
let homeSplashImpactTimeoutId;

function markRouteTransitionPending() {
  try {
    window.sessionStorage.setItem(routeTransitionStorageKey, "1");
  } catch {
    // Ignore session storage errors.
  }
}

function consumeRouteTransitionPending() {
  try {
    const pending = window.sessionStorage.getItem(routeTransitionStorageKey) === "1";
    window.sessionStorage.removeItem(routeTransitionStorageKey);
    return pending;
  } catch {
    return false;
  }
}

function isReducedMotion() {
  const forceMotionEnabled = document.body?.classList.contains("force-motion");
  return !forceMotionEnabled && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ensureTransitionLayer() {
  let layer = document.querySelector(".page-transition-layer");
  if (layer) {
    return layer;
  }

  layer = document.createElement("div");
  layer.className = "page-transition-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);
  return layer;
}

function playPageEnterTransition() {
  const root = document.documentElement;

  const shouldPlayTransition =
    root.classList.contains("route-transition-prep") || consumeRouteTransitionPending();
  if (!shouldPlayTransition) {
    return;
  }

  root.classList.add("route-transition-prep");

  if (isReducedMotion()) {
    root.classList.remove("route-transition-prep");
    return;
  }

  const layer = ensureTransitionLayer();
  layer.classList.remove("is-leaving");
  layer.classList.add("is-entering", "is-active");

  // Double rAF ensures transition state is committed before fade-out starts.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      root.classList.remove("route-transition-prep");
      layer.classList.remove("is-active");
    });
  });

  window.setTimeout(() => {
    layer.classList.remove("is-entering");
  }, pageEnterDuration);
}

function animateShellMount() {
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");

  if (!header && !footer) {
    return;
  }

  const splashOpen = document.body.classList.contains("splash-open");
  const reducedMotion = isReducedMotion();

  // Keep header stable and immediate to avoid delayed menu paint.
  header?.classList.remove("shell-motion");
  header?.classList.add("is-visible");

  if (splashOpen || reducedMotion) {
    footer?.classList.remove("shell-motion");
    footer?.classList.add("is-visible");
    return;
  }

  footer?.classList.remove("is-visible");
  footer?.classList.add("shell-motion");

  window.requestAnimationFrame(() => {
    footer?.classList.add("is-visible");
  });
}

function playHomePostSplashImpact() {
  if (!document.body.classList.contains("page-home") || isReducedMotion()) {
    return;
  }

  document.body.classList.remove("home-impact-enter");

  if (homeSplashImpactTimeoutId) {
    window.clearTimeout(homeSplashImpactTimeoutId);
    homeSplashImpactTimeoutId = undefined;
  }

  // Double rAF helps restart the class-based animation reliably.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.body.classList.add("home-impact-enter");
    });
  });

  homeSplashImpactTimeoutId = window.setTimeout(() => {
    document.body.classList.remove("home-impact-enter");
    homeSplashImpactTimeoutId = undefined;
  }, homeSplashImpactDuration);
}

function revealInViewTargets() {
  const targets = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!targets.length) {
    return;
  }

  if (revealObserver) {
    revealObserver.disconnect();
  }

  const reducedMotion = isReducedMotion();

  document.body.classList.add("motion-enabled");

  targets.forEach((target, index) => {
    const delay = Number(target.dataset.revealDelay);
    const normalizedDelay = Number.isFinite(delay) ? delay : index * 65;
    target.style.setProperty("--reveal-delay", `${normalizedDelay}ms`);

    if (reducedMotion) {
      target.classList.add("is-visible");
      return;
    }

    const targetTop = target.getBoundingClientRect().top;
    if (targetTop < window.innerHeight * 0.88) {
      window.setTimeout(() => {
        target.classList.add("is-visible");
      }, Math.max(0, normalizedDelay));
      return;
    }

    target.classList.remove("is-visible");
  });

  if (reducedMotion) {
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const target = entry.target;
        target.classList.add("is-visible");
        revealObserver?.unobserve(target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  targets
    .filter((target) => !target.classList.contains("is-visible"))
    .forEach((target) => {
      revealObserver?.observe(target);
    });
}

function shouldSkipLinkTransition(event, link, url) {
  if (event.defaultPrevented) {
    return true;
  }

  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }

  if (link.target && link.target !== "_self") {
    return true;
  }

  if (link.hasAttribute("download")) {
    return true;
  }

  if (url.origin !== window.location.origin) {
    return true;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return true;
  }

  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return true;
  }

  return false;
}

function bindLinkTransitions() {
  if (linkTransitionsBound) {
    return;
  }

  linkTransitionsBound = true;

  document.addEventListener("click", (event) => {
    if (leavingPage || isReducedMotion()) {
      return;
    }

    const link = event.target.closest("a[href]");
    if (!link) {
      return;
    }

    const rawHref = link.getAttribute("href") || "";
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      rawHref.startsWith("javascript:")
    ) {
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(rawHref, window.location.href);
    } catch {
      return;
    }

    if (shouldSkipLinkTransition(event, link, targetUrl)) {
      return;
    }

    event.preventDefault();
    leavingPage = true;
    markRouteTransitionPending();

    const layer = ensureTransitionLayer();
    layer.classList.remove("is-entering");
    layer.classList.add("is-leaving", "is-active");
    document.body.classList.add("page-leaving");

    window.setTimeout(() => {
      window.location.href = targetUrl.href;
    }, pageExitDuration);
  });
}

export function initPageMotion() {
  document.body.classList.add("force-motion");
  bindLinkTransitions();

  const splashOpen = document.body.classList.contains("splash-open");
  if (splashOpen) {
    document.documentElement.classList.remove("route-transition-prep");
    consumeRouteTransitionPending();

    // Prepare reveal state while splash is open so close transition only reverses the offset.
    revealInViewTargets();

    window.addEventListener(
      "home:splash-closing",
      () => {
        animateShellMount();
      },
      { once: true }
    );
    return;
  }

  playPageEnterTransition();
  animateShellMount();
  revealInViewTargets();
}