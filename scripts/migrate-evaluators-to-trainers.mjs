import nextEnv from "@next/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { loadEnvConfig } = nextEnv;
const BATCH_SIZE = 400;

function isEvaluator(data) {
  return data?.role === "Evaluator";
}

function isAdmin(data) {
  return data?.role === "Admin";
}

function canonicalEvaluator(document) {
  const data = document.data();
  const required = ["employeeId", "name", "email", "createdAt"];
  const missing = required.filter(
    (field) => typeof data[field] !== "string" || !data[field].trim(),
  );
  if (missing.length)
    throw new Error(
      `Evaluator document ${document.id} is missing: ${missing.join(", ")}.`,
    );

  return {
    id: document.id,
    employeeId: data.employeeId.trim(),
    name: data.name.trim(),
    email: data.email.trim(),
    role: "Evaluator",
    status: data.status === "Inactive" ? "Inactive" : "Active",
    createdAt: data.createdAt,
    updatedAt:
      typeof data.updatedAt === "string" && data.updatedAt
        ? data.updatedAt
        : data.createdAt,
  };
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size)
    chunks.push(items.slice(index, index + size));
  return chunks;
}

async function main() {
  const commit = process.argv.includes("--commit");
  loadEnvConfig(process.cwd());

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey)
    throw new Error("Firebase Admin environment variables are incomplete.");

  const app =
    getApps()[0] ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  const [usersSnapshot, trainersSnapshot] = await Promise.all([
    db.collection("users").get(),
    db.collection("trainers").get(),
  ]);

  const unexpectedUsers = usersSnapshot.docs.filter(
    (document) => !isAdmin(document.data()) && !isEvaluator(document.data()),
  );
  if (unexpectedUsers.length)
    throw new Error(
      `${unexpectedUsers.length} users document(s) have an unsupported role. Migration stopped without writes.`,
    );

  const sourceEvaluators = usersSnapshot.docs.filter((document) =>
    isEvaluator(document.data()),
  );
  const evaluators = sourceEvaluators.map(canonicalEvaluator);
  const employeeIds = new Set();
  for (const evaluator of evaluators) {
    const employeeId = evaluator.employeeId.toLowerCase();
    if (employeeIds.has(employeeId))
      throw new Error(
        `Duplicate evaluator employee ID detected: ${evaluator.employeeId}. Migration stopped without writes.`,
      );
    employeeIds.add(employeeId);
  }

  // These are records from the retired trainer master-data path. Recipients
  // are already the authoritative evaluation-subject collection.
  const retiredTrainerRecords = trainersSnapshot.docs.filter(
    (document) => !isEvaluator(document.data()),
  );
  const sourceIds = new Set(sourceEvaluators.map((document) => document.id));
  const destinationCollisions = trainersSnapshot.docs.filter(
    (document) =>
      sourceIds.has(document.id) &&
      isEvaluator(document.data()) &&
      document.data().employeeId !==
        evaluators.find((evaluator) => evaluator.id === document.id)?.employeeId,
  );
  if (destinationCollisions.length)
    throw new Error(
      `${destinationCollisions.length} evaluator ID collision(s) have different employee IDs. Migration stopped without writes.`,
    );

  console.log(`Admin documents retained in users: ${usersSnapshot.docs.filter((document) => isAdmin(document.data())).length}`);
  console.log(`Evaluator documents to move to trainers: ${evaluators.length}`);
  console.log(`Retired trainer documents to remove: ${retiredTrainerRecords.length}`);

  if (!commit) {
    console.log("Dry run complete. No Firestore documents were written.");
    console.log("Run again with --commit to move evaluators and remove retired trainer records.");
    return;
  }

  const actions = [
    ...evaluators.flatMap((evaluator) => [
      { type: "set", collection: "trainers", id: evaluator.id, data: evaluator },
      { type: "delete", collection: "users", id: evaluator.id },
    ]),
    ...retiredTrainerRecords.map((document) => ({
      type: "delete",
      collection: "trainers",
      id: document.id,
    })),
  ];
  for (const group of chunk(actions, BATCH_SIZE)) {
    const batch = db.batch();
    group.forEach((action) => {
      const ref = db.collection(action.collection).doc(action.id);
      if (action.type === "set") batch.set(ref, action.data);
      else batch.delete(ref);
    });
    await batch.commit();
  }

  const [verifiedUsers, verifiedTrainers] = await Promise.all([
    db.collection("users").get(),
    db.collection("trainers").get(),
  ]);
  const remainingEvaluators = verifiedUsers.docs.filter((document) =>
    isEvaluator(document.data()),
  );
  const verifiedEvaluatorIds = new Set(
    verifiedTrainers.docs
      .filter((document) => isEvaluator(document.data()))
      .map((document) => document.id),
  );
  const missingDestinations = evaluators.filter(
    (evaluator) => !verifiedEvaluatorIds.has(evaluator.id),
  );
  const remainingRetired = verifiedTrainers.docs.filter(
    (document) => !isEvaluator(document.data()),
  );
  if (
    remainingEvaluators.length ||
    missingDestinations.length ||
    remainingRetired.length
  )
    throw new Error(
      "Migration writes completed but verification failed. Do not rerun until the Firestore collections are inspected.",
    );

  console.log(`Migration complete and verified: ${evaluators.length} evaluator document(s) moved.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
