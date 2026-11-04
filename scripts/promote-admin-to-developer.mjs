import nextEnv from "@next/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { loadEnvConfig } = nextEnv;

async function main() {
  const commit = process.argv.includes("--commit");
  loadEnvConfig(process.cwd());

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId !== "tti-assessment")
    throw new Error("FIREBASE_PROJECT_ID must be tti-assessment.");
  if (!clientEmail || !privateKey)
    throw new Error("Firebase Admin environment variables are incomplete.");

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  const db = getFirestore(app);
  const users = await db.collection("users").get();
  const matches = users.docs.filter(
    (document) =>
      String(document.data().employeeId ?? "").toLowerCase() === "admin01",
  );
  if (matches.length !== 1)
    throw new Error(`Expected one ADMIN01 user, found ${matches.length}.`);

  const account = matches[0];
  const data = account.data();
  if (data.role !== "Admin" && data.role !== "Developer")
    throw new Error(`ADMIN01 has unsupported role: ${String(data.role)}.`);
  if (data.role === "Developer") {
    console.log("ADMIN01 is already a Developer.");
    return;
  }

  console.log(`Ready to promote ${data.employeeId} (${account.id}) in ${projectId}.`);
  if (!commit) {
    console.log("Dry run only. Re-run with --commit to update this account.");
    return;
  }

  await account.ref.update({ role: "Developer", updatedAt: new Date().toISOString() });
  console.log("ADMIN01 promoted to Developer.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Promotion failed.");
  process.exitCode = 1;
});