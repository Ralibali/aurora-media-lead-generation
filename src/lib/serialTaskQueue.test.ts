import { describe, expect, it, vi } from "vitest";
import { createSerialTaskQueue } from "./serialTaskQueue";

describe("lead update ordering", () => {
  it("waits for a previous write to the same record while other records remain independent", async () => {
    const enqueue = createSerialTaskQueue();
    let finish!: () => void;
    const slow = new Promise<void>(resolve => { finish = resolve; });
    const second = vi.fn(async () => "latest");
    const first = enqueue("a", () => slow);
    const last = enqueue("a", second);
    await expect(enqueue("b", async () => "independent")).resolves.toBe("independent");
    expect(second).not.toHaveBeenCalled();
    finish(); await first;
    await expect(last).resolves.toBe("latest");
    expect(second).toHaveBeenCalledOnce();
  });
  it("allows retry after a failed save", async () => {
    const enqueue = createSerialTaskQueue();
    const failed = enqueue("a", async () => { throw new Error("offline"); });
    const retry = enqueue("a", async () => "saved");
    await expect(failed).rejects.toThrow("offline");
    await expect(retry).resolves.toBe("saved");
  });
});
