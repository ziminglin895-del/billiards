import { GameEvent } from "../../events/gameevent"
import { Ball } from "../../model/ball"
import { Table } from "../../model/table"
import { AimCalculator } from "./aimcalculator"
import { BotDifficulty } from "./botdifficulty"

export interface BotShotContext {
  table: Table
  cueBall: Ball
  validTargetBalls: Ball[]
  ballInHand: boolean
  difficulty: BotDifficulty
}

export interface BotStrategy {
  readonly name: string
  aim(context: BotShotContext, calculator: AimCalculator): GameEvent[]
}
