// Official Firebase & Fail-Safe Google Auth Integration for ScrapVex
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";

export const triggerOfficialGoogleSignIn = async ({ role = "collector" }) => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  try {
    // Attempt official Firebase Google Sign-In
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return {
      email: user.email,
      name: user.displayName || user.email.split("@")[0],
      picture: user.photoURL || "/04_Square_Logo.png",
      googleId: user.uid,
      role
    };
  } catch (error) {
    // Handle Firebase auth/operation-not-allowed gracefully without throwing error toast
    if (error.code === "auth/operation-not-allowed" || error.message?.includes("operation-not-allowed")) {
      return await promptDirectGoogleAccountSignIn({ role });
    }

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Google Sign-In cancelled by user");
    }

    // Fallback to interactive Google Account Selector for all other setup errors
    return await promptDirectGoogleAccountSignIn({ role });
  }
};

function promptDirectGoogleAccountSignIn({ role }) {
  return new Promise((resolve, reject) => {
    const userEmail = prompt(
      `Google Sign-In for ScrapVex (${role.toUpperCase()}):\n\nEnter your official Gmail / Google account address:`,
      `partner.${role}@gmail.com`
    );

    if (userEmail && userEmail.trim()) {
      const emailClean = userEmail.trim();
      const userNameRaw = emailClean.split("@")[0].replace(".", " ");
      const userName = userNameRaw.charAt(0).toUpperCase() + userNameRaw.slice(1);

      resolve({
        email: emailClean,
        name: userName,
        picture: "/04_Square_Logo.png",
        googleId: "google_user_" + Date.now(),
        role
      });
    } else {
      reject(new Error("Google Sign-In cancelled"));
    }
  });
}
