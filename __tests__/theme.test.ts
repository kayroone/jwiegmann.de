import { describe, it, expect } from "vitest";
import * as themeModule from "@/app/components/theme";
import { getThemeForDate, getBackgroundForTheme } from "@/app/components/theme";

describe("getThemeForDate", () => {
  it.each([
    [2026, 1, 28, "stars"],
    [2026, 2, 1, "spring"],
    [2026, 4, 31, "spring"],
    [2026, 5, 1, "stars"],
    [2026, 7, 31, "stars"],
    [2026, 8, 1, "stars"],
    [2026, 8, 30, "stars"],
    [2026, 9, 1, "halloween"],
    [2026, 9, 31, "halloween"],
    [2026, 10, 1, "stars"],
  ])("%i-%i-%i is %s", (year, monthIndex, day, expected) => {
    expect(getThemeForDate(new Date(year, monthIndex, day, 12))).toBe(expected);
  });

  it("returns the same theme for every month regardless of the year", () => {
    const themesPerMonth = Array.from({ length: 12 }, (_, monthIndex) =>
      getThemeForDate(new Date(2026, monthIndex, 15, 12)),
    );

    expect(themesPerMonth).toEqual([
      "stars", "stars",
      "spring", "spring", "spring",
      "stars", "stars", "stars", "stars",
      "halloween",
      "stars", "stars",
    ]);
    expect(getThemeForDate(new Date(2031, 9, 15, 12))).toBe("halloween");
  });

  it("reads the local calendar date only", () => {
    const localOnly = { getMonth: () => 9, getDate: () => 1 } as Date;

    expect(getThemeForDate(localOnly)).toBe("halloween");
  });
});

describe("getBackgroundForTheme", () => {
  it.each([
    ["stars", "stars"],
    ["spring", "grass"],
    ["halloween", null],
    ["vines", null],
  ] as const)("%s shows %s", (theme, expected) => {
    expect(getBackgroundForTheme(theme)).toBe(expected);
  });
});

describe("theme module", () => {
  it("no longer exports a fixed theme constant", () => {
    expect("ACTIVE_THEME" in themeModule).toBe(false);
  });
});
