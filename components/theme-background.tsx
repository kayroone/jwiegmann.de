"use client";

import { useEffect, useState } from "react";
import StaticGrass from "./static-grass";
import StaticStars from "./static-stars";
import {
  getBackgroundForTheme,
  getThemeForDate,
  type BackgroundKind,
} from "../app/components/theme";

export default function ThemeBackground() {
  const [background, setBackground] = useState<BackgroundKind | null>(null);

  useEffect(() => {
    setBackground(getBackgroundForTheme(getThemeForDate(new Date())));
  }, []);

  switch (background) {
    case "stars":
      return <StaticStars />;
    case "grass":
      return <StaticGrass />;
    case null:
      return null;
  }
}
