import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repositories";

/** Public topic names shown on the login page. No assessment data is exposed. */
export async function GET() {
  const repo = getRepository();
  const [allTopics, versions] = await Promise.all([
    repo.getTopics(),
    repo.getAssessmentVersions(),
  ]);
  const topics = allTopics
    .filter((topic) => topic.status === "Active")
    .map(({ id, topicName, activeAssessmentVersionId }) => ({
      id,
      topicName,
      kind: versions.find((version) =>
        version.id === activeAssessmentVersionId && version.status === "Published",
      )?.kind ?? "assessment",
    }));

  return NextResponse.json(topics, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
