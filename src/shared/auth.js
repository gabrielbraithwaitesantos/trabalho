import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const authState = {
  user: null,
  isAdmin: false,
  initialized: false
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let activeSyncId = 0;
let resolveReady;
const readyPromise = new Promise((resolve) => {
  resolveReady = resolve;
});

function dispatchUserUpdated() {
  window.dispatchEvent(new CustomEvent("user:updated"));
}

function getDisplayName(firebaseUser) {
  const profileName = String(firebaseUser.displayName || "").trim();
  if (profileName) {
    return profileName;
  }

  const email = String(firebaseUser.email || "").trim();
  if (!email) {
    return "Cliente";
  }

  const [localPart] = email.split("@");
  return localPart || "Cliente";
}

async function checkAdminAccess(uid) {
  try {
    const directAdminDoc = await getDoc(doc(db, "admins", uid));
    if (directAdminDoc.exists()) {
      return true;
    }

    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      return false;
    }

    const role = String(userDoc.data()?.role || "").toLowerCase();
    return role === "admin";
  } catch {
    return false;
  }
}

onAuthStateChanged(auth, async (firebaseUser) => {
  const syncId = ++activeSyncId;

  if (!firebaseUser) {
    authState.user = null;
    authState.isAdmin = false;
    authState.initialized = true;
    resolveReady?.();
    resolveReady = undefined;
    dispatchUserUpdated();
    return;
  }

  const isAdmin = await checkAdminAccess(firebaseUser.uid);
  if (syncId !== activeSyncId) {
    return;
  }

  authState.user = {
    uid: firebaseUser.uid,
    name: getDisplayName(firebaseUser),
    email: String(firebaseUser.email || ""),
    isAdmin
  };
  authState.isAdmin = isAdmin;
  authState.initialized = true;
  resolveReady?.();
  resolveReady = undefined;
  dispatchUserUpdated();
});

export function waitForAuthReady() {
  return readyPromise;
}

export function getAuthSnapshot() {
  return {
    user: authState.user,
    isAdmin: authState.isAdmin,
    initialized: authState.initialized
  };
}

export async function signInWithEmailPassword(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogleProvider() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    const code = String(error?.code || "");

    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return {
        redirected: true
      };
    }

    throw error;
  }
}

export async function signUpWithEmailPassword({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const displayName = String(name || "").trim();

  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  return credential;
}

export async function signOutCurrentUser() {
  await signOut(auth);
}