import { z } from "zod";

const identifier = z.string().trim().min(1).max(128);
const businessUnitCode = z.enum(["G1", "G2", "G3", "G4", "EA", "TRM"]);

export const trainerPayloadSchema = z.object({
  id: identifier.optional(),
  employeeId: z.string().trim().min(1).max(64),
  trainerName: z.string().trim().min(1).max(200),
  bu: z.string().trim().min(1).max(128),
  status: z.enum(["Active", "Inactive"]).optional(),
  createdAt: z.string().datetime().optional()
});

export const questionPayloadSchema = z.object({
  id: identifier.optional(),
  categoryId: identifier,
  questionText: z.string().trim().min(1).max(2_000),
  options: z.array(z.string().trim().min(1).max(1_000)).max(10).default([]),
  weight: z.number().finite().min(0.01).max(100),
  maxScore: z.number().int().min(1).max(5),
  isActive: z.boolean().default(true)
});

export const evaluationPayloadSchema = z.object({
  recipientId: identifier,
  topicId: identifier,
  evaluationRound: z.number().int().min(1).max(99),
  comment: z.string().trim().max(5_000).default(""),
  scores: z.record(z.number().int().min(1).max(5))
});

export const recipientPayloadSchema = z.object({
  id: identifier.optional(),
  employeeId: z.string().trim().min(1).max(64),
  recipientName: z.string().trim().min(1).max(200),
  bu: z.string().trim().min(1).max(128),
  buCode: businessUnitCode,
  status: z.enum(["Active", "Inactive"]).optional()
});

export const topicPayloadSchema = z.object({
  id: identifier.optional(),
  topicName: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2_000).default(""),
  status: z.enum(["Active", "Inactive"]).optional()
});

export const evaluatorPayloadSchema = z.object({
  id: identifier.optional(),
  employeeId: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  status: z.enum(["Active", "Inactive"]).optional()
});
