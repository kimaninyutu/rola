import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  health: publicProcedure
    .input(z.object({ timestamp: z.number().min(0) }).optional())
    .query(() => ({ ok: true })),
});

export type AppRouter = typeof appRouter;
