let toastTimeoutId;

function hideToast(toastElement) {
  toastElement.classList.remove("is-visible");
}

export function showToast(message, options = {}) {
  const toastElement = document.querySelector("#toast");
  if (!toastElement) {
    return;
  }

  const actionLabel = String(options.actionLabel || "").trim();
  const actionHref = String(options.actionHref || "").trim();
  const hasAction = Boolean(actionLabel && actionHref);

  toastElement.textContent = "";

  const messageElement = document.createElement("span");
  messageElement.className = "toast-message";
  messageElement.textContent = message;
  toastElement.append(messageElement);

  if (hasAction) {
    const actionElement = document.createElement("a");
    actionElement.className = "toast-action";
    actionElement.href = actionHref;
    actionElement.textContent = actionLabel;
    actionElement.addEventListener("click", () => {
      hideToast(toastElement);
    });
    toastElement.append(actionElement);
    toastElement.classList.add("has-action");
  } else {
    toastElement.classList.remove("has-action");
  }

  toastElement.classList.add("is-visible");

  window.clearTimeout(toastTimeoutId);
  const duration = Number(options.duration);
  const timeout = Number.isFinite(duration) && duration > 0 ? duration : hasAction ? 4200 : 2400;
  toastTimeoutId = window.setTimeout(() => {
    hideToast(toastElement);
  }, timeout);
}
