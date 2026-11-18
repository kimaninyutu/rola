import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("application health", () => {
  it("returns a healthy response from the public router", async () => {
    const context: TrpcContext = {
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const result = await appRouter.createCaller(context).health({ timestamp: Date.now() });
    expect(result).toEqual({ ok: true });
  });
});
