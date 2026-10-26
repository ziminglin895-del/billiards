import { Vector3 } from "three"
import { AimCalculator } from "./aimcalculator"
import { zero } from "../../utils/three-utils"

export type BotDifficulty = "easy" | "normal" | "hard"

export function parseBotDifficulty(
  value: string | null | undefined
): BotDifficulty {
  return value === "easy" || value === "hard" ? value : "normal"
}

export function aimNoise(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case "easy":
      return 0.16
    case "hard":
      return 0
    default:
      return 0.015
  }
}

export function powerScale(difficulty: BotDifficulty): number {
  return difficulty === "easy" ? 0.8 : 1
}

export function spinOffset(difficulty: BotDifficulty): Vector3 {
  if (difficulty === "hard") {
    return zero.clone()
  }
  const scale = difficulty === "easy" ? 1.4 : 1
  return AimCalculator.randomSpin().multiplyScalar(scale)
}
