// Ikony druhov prvkov schemy (vrstvy, ponuka Pridat, zoznam zariadeni).
import { Building2, Cable, Lightbulb, Monitor, RectangleHorizontal, Speaker, Spline, Square, TrainTrack, Type, Volume2, type LucideIcon } from "lucide-react";
import type { SchemaElementKind } from "@/api";

export const KIND_ICONS: Record<SchemaElementKind, LucideIcon> = {
  track: TrainTrack,
  platform: RectangleHorizontal,
  building: Building2,
  area: Square,
  path: Spline,
  text: Type,
  board: Monitor,
  audio: Volume2,
  light: Lightbulb,
  amplifier: Speaker,
  commLine: Cable,
};
