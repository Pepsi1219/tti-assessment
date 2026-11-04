import { NextResponse } from "next/server";
import {
  getCurrentUser,
  isAdmin,
  matchesEvaluatorIdentity,
} from "@/lib/auth/authorization";
import { getEvaluationSummaries } from "@/lib/services/evaluation-service";
import { getEvaluationSummaryDetails } from "@/lib/services/evaluation-service";
import { redactAssessmentAnswerKeys } from "@/lib/services/assessment-version";

function encodeCursor(id: string) {
  return Buffer.from(id).toString("base64url");
}

function decodeCursor(value: string) {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return "";
  }
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const topicId = searchParams.get("topicId")?.trim();
  if (topicId) {
    const summaryId = searchParams.get("summaryId");
    if (summaryId) {
      const summary = await getEvaluationSummaryDetails(topicId, summaryId);
      if (!summary)
        return NextResponse.json({ error: "Summary not found" }, { status: 404 });
      const evaluatorHasAccess = summary.evaluations.some((evaluation) =>
        matchesEvaluatorIdentity(user, evaluation),
      );
      if (!isAdmin(user) && !evaluatorHasAccess)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const responseSummary = isAdmin(user)
        ? summary
        : {
            ...summary,
            evaluations: summary.evaluations
              .filter((evaluation) => matchesEvaluatorIdentity(user, evaluation))
              .map((evaluation) => evaluation.assessmentVersion
                ? { ...evaluation, assessmentVersion: redactAssessmentAnswerKeys(evaluation.assessmentVersion) }
                : evaluation),
          };
      return NextResponse.json(responseSummary, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const pageSize = Number(searchParams.get("limit") ?? 25);
    const cursorValue = searchParams.get("cursor");
    const cursor = cursorValue ? decodeCursor(cursorValue) : "";
    if (![25, 50, 100].includes(pageSize) || (cursorValue && !cursor))
      return NextResponse.json({ error: "Invalid summary list query" }, { status: 400 });

    let summaries = await getEvaluationSummaries(topicId);
    if (!isAdmin(user)) {
      summaries = summaries.filter((summary) =>
        summary.evaluations.some((evaluation) =>
          matchesEvaluatorIdentity(user, evaluation),
        ),
      );
    }

    const filterOptions = {
      buCodes: Array.from(new Set(summaries.map((summary) => summary.buCode).filter(Boolean))),
      departments: Array.from(new Set(summaries.map((summary) => summary.bu).filter(Boolean))).sort(),
      evaluators: Array.from(new Set(summaries.flatMap((summary) =>
        summary.evaluations.map((evaluation) => evaluation.evaluatorName).filter(Boolean),
      ))).sort(),
      years: Array.from(new Set(summaries.map((summary) => summary.evaluationYear))).sort().reverse(),
    };
    const employeeIdFilter = searchParams.get("employeeId")?.trim().toLowerCase();
    const evaluatorFilter = searchParams.get("evaluator");
    const buCodeFilter = searchParams.get("buCode");
    const departmentFilter = searchParams.get("department");
    const yearFilter = searchParams.get("year");
    const resultFilter = searchParams.get("result");
    summaries = summaries.filter((summary) =>
      (!employeeIdFilter || (summary.recipient?.employeeId ?? "").toLowerCase().includes(employeeIdFilter)) &&
      (!evaluatorFilter || summary.evaluations.some((evaluation) => evaluation.evaluatorName === evaluatorFilter)) &&
      (!buCodeFilter || summary.buCode === buCodeFilter) &&
      (!departmentFilter || summary.bu === departmentFilter) &&
      (!yearFilter || summary.evaluationYear === yearFilter) &&
      (!resultFilter || summary.result === resultFilter),
    );

    const cursorIndex = cursor
      ? summaries.findIndex((summary) => summary.id === cursor)
      : -1;
    const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const page = summaries.slice(startIndex, startIndex + pageSize + 1);
    const hasMore = page.length > pageSize;
    const items = page.slice(0, pageSize).map((summary) => ({
      ...summary,
      evaluations: [],
    }));
    return NextResponse.json({
      items,
      nextCursor: hasMore ? encodeCursor(page[pageSize - 1].id) : null,
      filterOptions,
    }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const summaries = await getEvaluationSummaries();
  if (isAdmin(user)) {
    return NextResponse.json(summaries, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const evaluatorSummaries = summaries.filter((summary) =>
    summary.evaluations.some((evaluation) =>
      matchesEvaluatorIdentity(user, evaluation),
    ),
  );
  return NextResponse.json(evaluatorSummaries.map((summary) => ({
    ...summary,
    evaluations: summary.evaluations.map((evaluation) => evaluation.assessmentVersion
      ? { ...evaluation, assessmentVersion: redactAssessmentAnswerKeys(evaluation.assessmentVersion) }
      : evaluation),
  })), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
