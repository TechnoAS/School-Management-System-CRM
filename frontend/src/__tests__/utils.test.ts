import { describe, it, expect, vi } from "vitest";
import { genId, FMT } from "@/lib/utils";
import { nextReceiptNumber } from "@/lib/receipt";
import { slugFilename, downloadCsv } from "@/lib/csv";

describe("genId", () => {
  it("increments from existing ids", () => {
    const list = [{ id: "STU-001" }, { id: "STU-005" }];
    expect(genId("STU", list)).toBe("STU-006");
  });
});

describe("nextReceiptNumber", () => {
  it("uses prefix and increments sequentially", () => {
    const receipt = nextReceiptNumber("RCP-2024-", "0890", [
      { receipt: "RCP-2024-0890", student: "A", studentId: "1", amount: 1, mode: "Cash", date: "2024-01-01" },
      { receipt: "RCP-2024-0891", student: "B", studentId: "2", amount: 1, mode: "Cash", date: "2024-01-02" },
    ]);
    expect(receipt).toBe("RCP-2024-0892");
  });
});

describe("slugFilename", () => {
  it("slugifies labels", () => {
    expect(slugFilename("Student Report")).toBe("student-report");
  });
});

describe("FMT", () => {
  it("formats INR currency", () => {
    expect(FMT.format(25000)).toContain("25");
  });
});

describe("downloadCsv", () => {
  it("builds csv content without throwing when DOM APIs are mocked", () => {
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const click = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      click,
      download: "",
      href: "",
    } as unknown as HTMLAnchorElement);

    expect(() => downloadCsv("test.csv", [{ a: 1, b: "x" }])).not.toThrow();
    expect(createObjectURL).toHaveBeenCalled();
  });
});
