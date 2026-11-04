import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin, isDeveloper } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { topicPayloadSchema } from "@/lib/validation/api";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repo = getRepository();
  const topics = await repo.getTopics();
  if (new URL(request.url).searchParams.get("includeLatestEvaluation") !== "1")
    return NextResponse.json(topics, {
      headers: { "Cache-Control": "private, no-store" }
    });

  const isEvaluator = user.role === "Evaluator";
  const [latestEvaluations, versions, evaluatorEvaluations] = await Promise.all([
    isEvaluator
      ? Promise.resolve([])
      : Promise.all(topics.map((topic) => repo.getLatestEvaluationByTopicId(topic.id))),
    repo.getAssessmentVersions(),
    isEvaluator
      ? repo.getEvaluationsByEvaluator(user.employeeId, user.email)
      : Promise.resolve(null),
  ]);
  const evaluatorEvaluationsByTopic = new Map<string, typeof evaluatorEvaluations>();
  evaluatorEvaluations?.forEach((evaluation) => {
    const topicEvaluations = evaluatorEvaluationsByTopic.get(evaluation.topicId) ?? [];
    evaluatorEvaluationsByTopic.set(evaluation.topicId, [...topicEvaluations, evaluation]);
  });
  const topicsWithLatestEvaluation = topics.map((topic, index) => {
    const topicEvaluatorEvaluations = evaluatorEvaluationsByTopic.get(topic.id) ?? [];
    const latestEvaluation = isEvaluator
      ? topicEvaluatorEvaluations[0]
      : latestEvaluations[index];
    const assessmentVersion = versions.find(
      (version) => version.id === latestEvaluation?.assessmentVersionId,
    );
    return {
      ...topic,
      latestEvaluationRound: latestEvaluation?.evaluationRound,
      hasLatestEvaluation: Boolean(latestEvaluation),
      evaluationCount: isEvaluator ? topicEvaluatorEvaluations.length : undefined,
      latestEvaluationDate: latestEvaluation?.evaluationDate,
      latestAssessmentName: assessmentVersion?.name,
      latestAssessmentVersionNumber: assessmentVersion?.version,
    };
  });

  return NextResponse.json(topicsWithLatestEvaluation, {
    headers: { "Cache-Control": "private, no-store" }
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDeveloper(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const payload = topicPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid topic data" }, { status: 400 });

  const repo = getRepository();
  if (payload.data.activeAssessmentVersionId) {
    const version = (await repo.getAssessmentVersions()).find(
      (item) =>
        item.id === payload.data.activeAssessmentVersionId &&
        item.status === "Published",
    );
    if (!version)
      return NextResponse.json(
        { error: "The selected assessment version is not published." },
        { status: 400 },
      );
  }
  const now = new Date().toISOString();
  const existing = payload.data.id
    ? (await repo.getTopics()).find((item) => item.id === payload.data.id)
    : undefined;
  const topic = await repo.upsertTopic({
    id: payload.data.id ?? `topic-${crypto.randomUUID()}`,
    topicName: payload.data.topicName,
    description: payload.data.description,
    status: payload.data.status ?? "Active",
    activeAssessmentVersionId:
      payload.data.activeAssessmentVersionId === undefined
        ? existing?.activeAssessmentVersionId
        : payload.data.activeAssessmentVersionId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });

  return NextResponse.json(topic);
}
