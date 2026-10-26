import { Vector3 } from "three"
import { Ball } from "../../model/ball"
import { R } from "../../model/physics/constants"
import { Table } from "../../model/table"
import { TableGeometry } from "../../view/tablegeometry"
import { AimCalculator } from "./aimcalculator"
import { BotShotContext } from "./botstrategy"

type PlacementCandidate = {
  cue: Vector3
  score: number
}

export class BotPlacement {
  private static readonly MARGIN = 1.5 * R
  private static readonly GHOST_DISTANCE = 2.001 * R
  private static readonly OFFSETS = [4, 6, 8, 10]

  static choose(
    context: BotShotContext,
    calculator: AimCalculator
  ): Vector3 | undefined {
    if (!TableGeometry.hasPockets || calculator.pockets.length === 0) {
      return undefined
    }
    const targets = context.validTargetBalls.filter((ball) => ball.onTable())
    if (targets.length === 0) {
      return undefined
    }

    let best: PlacementCandidate | undefined
    for (const target of targets) {
      for (const pocket of calculator.pockets) {
        const candidate = this.forPocket(context, target, pocket)
        if (candidate && (!best || candidate.score < best.score)) {
          best = candidate
        }
      }
    }
    return best?.cue
  }

  private static forPocket(
    context: BotShotContext,
    target: Ball,
    pocket: Vector3
  ): PlacementCandidate | undefined {
    const toTarget = target.pos.clone().sub(pocket).normalize()
    const ghost = target.pos
      .clone()
      .add(toTarget.clone().multiplyScalar(this.GHOST_DISTANCE))

    if (!this.isOnTable(ghost) || this.overlaps(context.table, ghost)) {
      return undefined
    }
    if (this.pathBlocked(context.table, target.pos, pocket, target)) {
      return undefined
    }

    let best: PlacementCandidate | undefined
    for (const offset of this.OFFSETS) {
      const cue = ghost.clone().add(toTarget.clone().multiplyScalar(offset * R))
      if (!this.isOnTable(cue) || this.overlaps(context.table, cue)) {
        continue
      }
      if (this.pathBlocked(context.table, cue, ghost, target)) {
        continue
      }
      const score =
        target.pos.distanceTo(pocket) * 0.65 + cue.distanceTo(target.pos) * 0.35
      if (!best || score < best.score) {
        best = { cue, score }
      }
    }
    return best
  }

  private static isOnTable(pos: Vector3): boolean {
    return (
      Math.abs(pos.x) <= TableGeometry.tableX - this.MARGIN &&
      Math.abs(pos.y) <= TableGeometry.tableY - this.MARGIN
    )
  }

  private static overlaps(table: Table, pos: Vector3): boolean {
    return table.balls.some(
      (ball) =>
        ball !== table.cueball &&
        ball.onTable() &&
        ball.pos.distanceTo(pos) < 2 * R
    )
  }

  private static pathBlocked(
    table: Table,
    start: Vector3,
    end: Vector3,
    target: Ball
  ): boolean {
    const path = end.clone().sub(start)
    const lengthSq = path.lengthSq()
    if (lengthSq < 1e-8) {
      return false
    }
    return table.balls.some((ball) => {
      if (ball === table.cueball || ball === target || !ball.onTable()) {
        return false
      }
      const relative = ball.pos.clone().sub(start)
      const along = relative.dot(path) / lengthSq
      if (along < 0 || along > 1) {
        return false
      }
      const closest = start.clone().add(path.clone().multiplyScalar(along))
      return closest.distanceTo(ball.pos) < 2 * R
    })
  }
}
