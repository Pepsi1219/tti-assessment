import nextEnv from "@next/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { loadEnvConfig } = nextEnv;
const BATCH_SIZE = 450;

function normalized(value) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

async function main() {
  const commit = process.argv.includes("--commit");
  loadEnvConfig(process.cwd());

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin environment variables are incomplete.");
  }

  const app =
    getApps()[0] ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  const [usersSnapshot, evaluationsSnapshot] = await Promise.all([
    db.collection("users").get(),
    db.collection("evaluations").get(),
  ]);

  const evaluators = usersSnapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .filter((user) => user.role === "Evaluator");
  const evaluatorsByName = new Map();
  for (const evaluator of evaluators) {
    const name = normalized(evaluator.name);
    const matches = evaluatorsByName.get(name) ?? [];
    matches.push(evaluator);
    evaluatorsByName.set(name, matches);
  }

  const updates = evaluationsSnapshot.docs.flatMap((document) => {
    const evaluation = { id: document.id, ...document.data() };
    if (evaluation.evaluatorEmployeeId && evaluation.evaluatorEmail) return [];

    const matches = evaluatorsByName.get(normalized(evaluation.evaluatorName)) ?? [];
    if (matches.length !== 1) return [];

    const evaluator = matches[0];
    return [
      {
        id: evaluation.id,
        evaluatorName: evaluator.name,
        evaluatorEmployeeId: evaluator.employeeId,
        evaluatorEmail: evaluator.email,
      },
    ];
  });

  const unresolved = evaluationsSnapshot.docs.filter((document) => {
    const evaluation = { id: document.id, ...document.data() };
    if (evaluation.evaluatorEmployeeId && evaluation.evaluatorEmail) return false;
    return (evaluatorsByName.get(normalized(evaluation.evaluatorName)) ?? [])
      .length !== 1;
  });

  console.log(`Evaluations scanned: ${evaluationsSnapshot.size}`);
  console.log(`Evaluations eligible for identity backfill: ${updates.length}`);
  console.log(`Evaluations skipped because the evaluator name is not unique: ${unresolved.length}`);

  if (!commit) {
    console.log("Dry run complete. No Firestore documents were written.");
    console.log("Run again with --commit to apply the verified updates.");
    return;
  }

  for (let start = 0; start < updates.length; start += BATCH_SIZE) {
    const batch = db.batch();
    updates.slice(start, start + BATCH_SIZE).forEach((update) => {
      batch.update(db.collection("evaluations").doc(update.id), {
        evaluatorName: update.evaluatorName,
        evaluatorEmployeeId: update.evaluatorEmployeeId,
        evaluatorEmail: update.evaluatorEmail,
      });
    });
    await batch.commit();
  }

  const verification = await Promise.all(
    updates.map((update) => db.collection("evaluations").doc(update.id).get()),
  );
  const failed = verification.filter((document) => {
    const data = document.data();
    return !data?.evaluatorEmployeeId || !data.evaluatorEmail;
  });
  if (failed.length) {
    throw new Error(`${failed.length} evaluation identity update(s) could not be verified.`);
  }
  console.log(`Backfill complete and verified: ${updates.length} evaluations updated.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
