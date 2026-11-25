"use client";

import { cn } from "@/lib/utils";
import type { Question, QuestionAnswer } from "@/lib/types";
import { CalendarDateInput } from "@/components/ui/calendar-date-input";
import { Heart, Star, ThumbsUp } from "lucide-react";

export function CriterionQuestion({
  index,
  question,
  answer,
  onAnswer,
}: {
  index: number;
  question: Question;
  answer?: QuestionAnswer;
  onAnswer: (answer: QuestionAnswer | undefined) => void;
}) {
  const answerType = question.answerType ?? "rating";
  const scaleSize = answerType === "nps" ? 10 : question.maxScore || 5;
  const scaleLabels = question.options.length ? question.options : Array.from({ length: scaleSize }, (_, index) => String(index + 1));
  const ratingMinScore = question.minScore ?? 1;
  const ratingMinLabel = question.minScoreLabel ?? question.options[0] ?? "";
  const ratingMaxLabel = question.maxScoreLabel ?? question.options.at(-1) ?? "";
  const selectedChoice = Array.isArray(answer) ? answer : typeof answer === "string" ? [answer] : [];
  const likertAnswers = answer && typeof answer === "object" && !Array.isArray(answer)
    ? answer as Record<string, number>
    : {};
  const rankingAnswers = Array.isArray(answer) ? answer : [];

  return (
    <fieldset className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5">
      <legend className="sr-only">{question.questionText}</legend>
      <div className="flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
          {index}
        </span>
        <p className="pt-1 text-sm font-bold leading-6 text-slate-800">
          {question.questionText}
        </p>
      </div>
      {answerType === "text" && <textarea className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-primary" value={typeof answer === "string" ? answer : ""} onChange={(event) => onAnswer(event.target.value || undefined)} aria-label={question.questionText} />}
      {answerType === "date" && <CalendarDateInput value={typeof answer === "string" ? answer : ""} onChange={onAnswer} label={question.questionText} />}
      {answerType === "choice" && <div className="mt-4 space-y-2">{question.options.map((option) => {
        const selected = selectedChoice.includes(option);
        return <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50">
          <input type={question.allowMultiple ? "checkbox" : "radio"} name={`question-${question.id}`} checked={selected} onChange={() => {
            if (question.allowMultiple) {
              const next = selected ? selectedChoice.filter((value) => value !== option) : [...selectedChoice, option];
              onAnswer(next.length ? next : undefined);
            } else onAnswer(option);
          }} />{option}
        </label>;
      })}</div>}
      {answerType === "ranking" && <div className="mt-4 space-y-2">{question.options.map((_, rank) => <label key={rank} className="flex items-center gap-3 text-sm"><span className="w-20 shrink-0 font-semibold">{rank + 1}</span><select className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3" value={rankingAnswers[rank] ?? ""} onChange={(event) => {
        const next = Array.from({ length: question.options.length }, (_, index) => rankingAnswers[index] ?? "");
        next[rank] = event.target.value;
        onAnswer(next.some(Boolean) ? next : undefined);
      }}><option value="">{question.questionText}</option>{question.options.filter((option) => option === rankingAnswers[rank] || !rankingAnswers.includes(option)).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}</div>}
      {answerType === "likert" && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-center text-sm"><thead><tr><th className="p-2 text-left" />{Array.from({ length: scaleSize }, (_, index) => <th key={index} className="max-w-24 p-2 font-medium text-slate-600"><div className="flex flex-col items-center gap-2"><span>{scaleLabels[index] ?? index + 1}</span>{question.likertIcon === "heart" ? <Heart aria-hidden="true" className="h-6 w-6 text-slate-500" /> : question.likertIcon === "thumbs-up" ? <ThumbsUp aria-hidden="true" className="h-6 w-6 text-slate-500" /> : <Star aria-hidden="true" className="h-6 w-6 text-slate-500" />}</div></th>)}</tr></thead><tbody>{(question.statements ?? []).map((statement, row) => <tr key={`${row}-${statement}`} className="border-t border-slate-100"><th className="p-3 text-left font-medium">{statement}</th>{Array.from({ length: scaleSize }, (_, index) => <td key={index} className="p-2"><input type="radio" name={`question-${question.id}-row-${row}`} aria-label={`${statement}: ${scaleLabels[index] ?? index + 1}`} checked={likertAnswers[String(row)] === index + 1} onChange={() => onAnswer({ ...likertAnswers, [String(row)]: index + 1 })} /></td>)}</tr>)}</tbody></table></div>}
      {answerType === "rating" && question.minScore !== undefined && <div className="mt-4 space-y-2">
        {(ratingMinLabel || ratingMaxLabel) && <div className="flex justify-between gap-4 text-xs text-slate-500"><span>{ratingMinLabel}</span><span className="text-right">{ratingMaxLabel}</span></div>}
        <div className="flex flex-wrap gap-2">{Array.from({ length: Math.max(0, question.maxScore - ratingMinScore + 1) }, (_, index) => {
          const value = ratingMinScore + index;
          const selected = answer === value;
          return <button key={value} type="button" onClick={() => onAnswer(value)} aria-pressed={selected} className={cn("flex min-h-12 min-w-12 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition", selected ? "border-primary bg-primary text-white" : "border-slate-200 bg-white hover:border-primary hover:bg-primary/5")}>{value}</button>;
        })}</div>
      </div>}
      {((answerType === "rating" && question.minScore === undefined) || answerType === "nps") && <div className={cn("mt-4 gap-2", question.options.length ? "flex flex-col" : "flex flex-wrap")}>{Array.from({ length: scaleSize + (answerType === "nps" ? 1 : 0) }, (_, index) => {
        const value = answerType === "nps" ? index : index + 1;
        const selected = answer === value;
        const label = answerType === "nps" ? String(value) : scaleLabels[index] ?? String(value);
        return <button key={value} type="button" onClick={() => onAnswer(value)} aria-pressed={selected} className={cn("flex min-h-12 min-w-12 items-center rounded-lg border px-3 text-sm font-semibold transition", question.options.length > 0 ? "w-full justify-start text-left" : "justify-center", selected ? "border-primary bg-primary text-white" : "border-slate-200 bg-white hover:border-primary hover:bg-primary/5")}>{label}</button>;
      })}</div>}
      {question.isRequired === false && <button type="button" className="mt-3 text-xs font-semibold text-slate-500 underline" onClick={() => onAnswer(undefined)}>Clear response</button>}
    </fieldset>
  );
}