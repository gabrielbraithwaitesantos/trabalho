import {
  getAuthSnapshot,
  signInWithEmailPassword,
  signInWithGoogleProvider,
  signOutCurrentUser,
  signUpWithEmailPassword,
  waitForAuthReady
} from "../shared/auth";
import { renderShell, updateShellHeaderState } from "../shared/shell";
import { showToast } from "../shared/notifications";
import { initPageMotion } from "../shared/motion";

renderShell("login");
initPageMotion();

const formElement = document.querySelector("#login-form");
const feedbackElement = document.querySelector("#login-feedback");
const modeHelperElement = document.querySelector("#login-mode-helper");
const submitButtonElement = document.querySelector("#login-submit-button");
const signInModeButtonElement = document.querySelector("#auth-mode-signin");
const signUpModeButtonElement = document.querySelector("#auth-mode-signup");
const googleLoginButtonElement = document.querySelector("#google-login-button");
const nameFieldElement = document.querySelector("#login-name-field");
const nameInputElement = document.querySelector("#login-name");
const emailInputElement = document.querySelector("#login-email");
const passwordInputElement = document.querySelector("#login-password");
const loggedUserPanelElement = document.querySelector("#logged-user-panel");
const loggedUserTextElement = document.querySelector("#logged-user-text");
const logoutButtonElement = document.querySelector("#logout-button");

const loginState = {
  mode: "signin",
  submitting: false
};

function formatAuthError(error, method = "password") {
  const code = String(error?.code || "");

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    return "E-mail ou senha inválidos.";
  }

  if (code === "auth/email-already-in-use") {
    return "Este e-mail já possui cadastro. Tente entrar.";
  }

  if (code === "auth/invalid-email") {
    return "Informe um e-mail válido.";
  }

  if (code === "auth/weak-password") {
    return "Use uma senha mais forte, com pelo menos 6 caracteres.";
  }

  if (code === "auth/too-many-requests") {
    return "Muitas tentativas agora. Aguarde alguns minutos e tente novamente.";
  }

  if (code === "auth/popup-closed-by-user") {
    return "A janela de login foi fechada antes da conclusão.";
  }

  if (code === "auth/popup-blocked") {
    return "Seu navegador bloqueou o popup do Google. Libere popups e tente novamente.";
  }

  if (code === "auth/unauthorized-domain") {
    return "Este domínio ainda não foi autorizado no Firebase Authentication.";
  }

  if (code === "auth/account-exists-with-different-credential") {
    return "Já existe conta para este e-mail com outro método de login.";
  }

  if (code === "auth/operation-not-allowed") {
    if (method === "google") {
      return "Login com Google desativado no Firebase. Ative o provedor Google no console.";
    }

    return "Login por e-mail/senha desativado no Firebase. Ative esse provedor para continuar.";
  }

  return "Não foi possível concluir o acesso agora. Tente novamente.";
}

function setSubmitting(isSubmitting) {
  loginState.submitting = isSubmitting;

  submitButtonElement.disabled = isSubmitting;
  signInModeButtonElement.disabled = isSubmitting;
  signUpModeButtonElement.disabled = isSubmitting;
  googleLoginButtonElement.disabled = isSubmitting;

  if (isSubmitting) {
    submitButtonElement.textContent = loginState.mode === "signup" ? "Criando conta..." : "Entrando...";
    return;
  }

  submitButtonElement.textContent =
    loginState.mode === "signup" ? "Criar conta com e-mail" : "Entrar na conta";
}

function setMode(mode) {
  loginState.mode = mode;

  const isSignUp = mode === "signup";

  signInModeButtonElement.classList.toggle("active", !isSignUp);
  signUpModeButtonElement.classList.toggle("active", isSignUp);
  signInModeButtonElement.setAttribute("aria-selected", String(!isSignUp));
  signUpModeButtonElement.setAttribute("aria-selected", String(isSignUp));

  nameFieldElement.classList.toggle("is-hidden", !isSignUp);
  nameInputElement.required = isSignUp;

  modeHelperElement.textContent = isSignUp
    ? "Crie sua conta para salvar pedidos e acompanhar sua jornada de compra."
    : "Entre com e-mail e senha da sua conta.";

  feedbackElement.textContent = "";
  setSubmitting(false);
}

async function togglePanels() {
  await waitForAuthReady();
  const { user, isAdmin } = getAuthSnapshot();

  if (!user) {
    formElement.classList.remove("is-hidden");
    loggedUserPanelElement.classList.add("is-hidden");
    return;
  }

  formElement.classList.add("is-hidden");
  loggedUserPanelElement.classList.remove("is-hidden");
  const adminSuffix = isAdmin ? " Seu acesso administrativo está ativo." : "";
  loggedUserTextElement.textContent = `Conta ativa para ${user.name} (${user.email}).${adminSuffix}`;
}

formElement.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (loginState.submitting) {
    return;
  }

  const formData = new FormData(formElement);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    feedbackElement.textContent = "Preencha e-mail e senha para continuar.";
    return;
  }

  if (loginState.mode === "signup" && !name) {
    feedbackElement.textContent = "Informe seu nome para criar a conta.";
    return;
  }

  if (password.length < 6) {
    feedbackElement.textContent = "A senha precisa ter no mínimo 6 caracteres.";
    return;
  }

  setSubmitting(true);

  try {
    if (loginState.mode === "signup") {
      await signUpWithEmailPassword({ name, email, password });
      feedbackElement.textContent = "Conta criada com sucesso. Redirecionando...";
      showToast("Conta criada e conectada com sucesso.");
    } else {
      await signInWithEmailPassword(email, password);
      feedbackElement.textContent = "Login realizado com sucesso. Redirecionando...";
      showToast("Bem-vinda! Sua conta foi conectada.");
    }

    updateShellHeaderState();

    window.setTimeout(() => {
      window.location.href = "/products.html";
    }, 900);
  } catch (error) {
    feedbackElement.textContent = formatAuthError(error, "password");
    setSubmitting(false);
  }
});

signInModeButtonElement.addEventListener("click", () => {
  setMode("signin");
});

signUpModeButtonElement.addEventListener("click", () => {
  setMode("signup");
});

googleLoginButtonElement.addEventListener("click", async () => {
  if (loginState.submitting) {
    return;
  }

  feedbackElement.textContent = "";
  setSubmitting(true);

  try {
    const result = await signInWithGoogleProvider();

    if (result?.redirected) {
      feedbackElement.textContent = "Abrindo autenticação do Google...";
      return;
    }

    feedbackElement.textContent = "Login com Google realizado com sucesso. Redirecionando...";
    showToast("Conta Google conectada com sucesso.");
    updateShellHeaderState();

    window.setTimeout(() => {
      window.location.href = "/products.html";
    }, 900);
  } catch (error) {
    feedbackElement.textContent = formatAuthError(error, "google");
    setSubmitting(false);
  }
});

logoutButtonElement.addEventListener("click", async () => {
  try {
    await signOutCurrentUser();
    updateShellHeaderState();
    await togglePanels();
    showToast("Conta desconectada.");
  } catch {
    showToast("Não foi possível sair agora. Tente novamente.");
  }
});

window.addEventListener("user:updated", () => {
  updateShellHeaderState();
  togglePanels();
});

setMode("signin");
togglePanels();
