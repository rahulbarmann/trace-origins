import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const pipelineSchema = z.object({
    name: z.string().min(2, "Pipeline name must be at least 2 characters"),
    description: z.string().optional(),
});

export const stageSchema = z.object({
    name: z.string().min(2, "Stage name must be at least 2 characters"),
    description: z.string().optional(),
    order: z.number().int().min(0),
});

export const productSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    pipelineId: z.string().uuid("Invalid pipeline ID"),
});

export const stageDataSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    stageId: z.string().uuid("Invalid stage ID"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PipelineInput = z.infer<typeof pipelineSchema>;
export type StageInput = z.infer<typeof stageSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type StageDataInput = z.infer<typeof stageDataSchema>;
