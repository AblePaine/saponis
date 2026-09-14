import type { BatchResult } from "@/types/soap";

export type SafetyLevel = "safe" | "caution" | "hazard";

export function safetyLevel(result: BatchResult): SafetyLevel {
  if (result.safetyAlerts.some((alert) => alert.startsWith("DANGER_"))) {
    return "hazard";
  }
  if (result.safetyAlerts.length > 0) return "caution";
  return "safe";
}

export function safetyLabel(level: SafetyLevel): string {
  if (level === "hazard") return "Hazardous";
  if (level === "caution") return "Caution";
  return "Safe";
}
