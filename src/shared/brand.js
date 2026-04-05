import { logoCandidates } from "./constants";

let logoSourcePromise;

function resolveLogoSource() {
  if (logoSourcePromise) {
    return logoSourcePromise;
  }

  logoSourcePromise = new Promise((resolve) => {
    let index = 0;

    const tryNext = () => {
      if (index >= logoCandidates.length) {
        resolve("");
        return;
      }

      const candidate = logoCandidates[index];
      index += 1;
      const imageProbe = new Image();
      imageProbe.addEventListener("load", () => resolve(candidate));
      imageProbe.addEventListener("error", tryNext);
      imageProbe.src = candidate;
    };

    tryNext();
  });

  return logoSourcePromise;
}

export async function mountBrandAssets(scope = document) {
  const logoImages = Array.from(scope.querySelectorAll("[data-brand-logo]"));
  const logoFallbacks = Array.from(scope.querySelectorAll("[data-logo-fallback]"));

  if (!logoImages.length && !logoFallbacks.length) {
    return;
  }

  const source = await resolveLogoSource();

  if (source) {
    logoImages.forEach((element) => {
      element.src = source;
      element.classList.remove("is-hidden");
    });
    logoFallbacks.forEach((element) => {
      element.classList.add("is-hidden");
    });
    return;
  }

  logoImages.forEach((element) => {
    element.classList.add("is-hidden");
    element.removeAttribute("src");
  });
  logoFallbacks.forEach((element) => {
    element.classList.remove("is-hidden");
  });
}
