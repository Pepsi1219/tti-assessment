import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repositories";

/** Public topic names shown on the login page. No assessment data is exposed. */
export async function GET() {
  const topics = (await getRepository().getTopics())
    .filter((topic) => topic.status === "Active")
    .map(({ id, topicName }) => ({ id, topicName }));

  return NextResponse.json(topics, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
