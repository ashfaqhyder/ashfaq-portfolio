import { adminAuth } from "../lib/firebase/admin";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run set-admin -- user@example.com");
  process.exit(1);
}

async function setAdmin() {
  try {
    const user = await adminAuth.getUserByEmail(email);

    await adminAuth.setCustomUserClaims(user.uid, {
      admin: true,
    });

    console.log(`Admin role assigned to: ${email}`);
    console.log(`UID: ${user.uid}`);
  } catch (error) {
    console.error("Failed to assign admin role:", error);
    process.exit(1);
  }
}

setAdmin();