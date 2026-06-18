import { describe, it, expect } from "vitest";
import { formatEquiv } from "./utils";

describe("formatEquiv", () => {
  it("renders exactly 0 as '0'", () => {
    expect(formatEquiv(0)).toBe("0");
  });

  it("renders a tiny nonzero value as '< 0.1' instead of rounding to 0", () => {
    expect(formatEquiv(0.04)).toBe("< 0.1");
    expect(formatEquiv(0.099)).toBe("< 0.1");
  });

  it("renders mid-range values with one decimal place", () => {
    expect(formatEquiv(0.1)).toBe("0.1");
    expect(formatEquiv(2.34)).toBe("2.3");
    expect(formatEquiv(10)).toBe("10.0");
  });

  it("renders large values as whole numbers", () => {
    expect(formatEquiv(10.6)).toBe("11");
    expect(formatEquiv(123.4)).toBe("123");
  });

  it("treats negative and non-finite values as '0'", () => {
    expect(formatEquiv(-5)).toBe("0");
    expect(formatEquiv(Number.NaN)).toBe("0");
    expect(formatEquiv(Number.POSITIVE_INFINITY)).toBe("0");
  });
});
