export type Theme = "stars" | "spring" | "vines" | "halloween";

export type BackgroundKind = "stars" | "grass";

const OCTOBER = 9;
const SPRING_MONTHS = [2, 3, 4];

export function getThemeForDate(date: Date): Theme {
  const month = date.getMonth();

  if (month === OCTOBER) {
    return "halloween";
  }
  if (SPRING_MONTHS.includes(month)) {
    return "spring";
  }
  return "stars";
}

export function getBackgroundForTheme(theme: Theme): BackgroundKind | null {
  switch (theme) {
    case "stars":
      return "stars";
    case "spring":
      return "grass";
    case "vines":
    case "halloween":
      return null;
  }
}
