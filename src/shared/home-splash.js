const splashCloseDuration = 260;

function emitSplashEvent(eventName, source) {
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: { source }
    })
  );
}

export function initHomeSplash() {
  const splashElement = document.querySelector("#home-splash");
  if (!splashElement) {
    return;
  }

  const startButtonElement = splashElement.querySelector("[data-splash-start]");
  const dismissElements = Array.from(splashElement.querySelectorAll("[data-splash-dismiss]"));

  let isClosing = false;

  const closeSplash = (source) => {
    if (isClosing) {
      return;
    }

    isClosing = true;

    document.body.classList.remove("splash-open");
    splashElement.classList.add("is-closing");
    splashElement.setAttribute("aria-hidden", "true");
    emitSplashEvent("home:splash-closing", source);

    window.setTimeout(() => {
      splashElement.classList.add("is-hidden");
      splashElement.classList.remove("is-visible", "is-closing");
      document.body.classList.add("splash-revealed");
      emitSplashEvent("home:splash-closed", source);
    }, splashCloseDuration);
  };

  const onKeyDown = (event) => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    closeSplash("dismiss");
  };

  document.body.classList.add("splash-open");
  document.body.classList.remove("splash-revealed");
  splashElement.classList.remove("is-hidden");
  splashElement.classList.add("is-visible");
  splashElement.setAttribute("aria-hidden", "false");

  startButtonElement?.focus({ preventScroll: true });

  dismissElements.forEach((element) => {
    element.addEventListener("click", () => {
      closeSplash("dismiss");
    });
  });

  startButtonElement?.addEventListener("click", () => {
    closeSplash("dismiss");
  });

  document.addEventListener("keydown", onKeyDown);

  window.addEventListener(
    "home:splash-closed",
    () => {
      document.removeEventListener("keydown", onKeyDown);
    },
    { once: true }
  );
}