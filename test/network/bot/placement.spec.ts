import { Container } from "../../../src/container/container"
import { Ball, State } from "../../../src/model/ball"
import { R } from "../../../src/model/physics/constants"
import { Session } from "../../../src/network/client/session"
import { AimCalculator } from "../../../src/network/bot/aimcalculator"
import { BotPlacement } from "../../../src/network/bot/placement"
import { parseBotDifficulty } from "../../../src/network/bot/botdifficulty"
import { TableGeometry } from "../../../src/view/tablegeometry"
import { Assets } from "../../../src/view/assets"
import { initDom } from "../../view/dom"

initDom()

describe("BotPlacement", () => {
  let container: Container

  beforeEach(() => {
    Ball.id = 0
    Session.init("test-client", "TestPlayer", "test-table", false)
    container = new Container({
      element: undefined,
      log: (_: any) => {},
      assets: Assets.localAssets(),
      ruletype: "nineball",
    })
    container.table.balls.forEach((ball) => {
      if (ball.id !== 0 && ball.id !== 9) {
        ball.state = State.InPocket
      }
    })
  })

  it("selects a clear cue ball position behind the target line", () => {
    const cueball = container.table.cueball
    const target = container.table.balls[9]
    cueball.pos.set(-0.6, 0, 0)
    target.pos.set(0.45, 0.18, 0)

    const chosen = BotPlacement.choose(
      {
        table: container.table,
        cueBall: cueball,
        validTargetBalls: [target],
        ballInHand: true,
        difficulty: "normal",
      },
      new AimCalculator()
    )

    expect(chosen).toBeDefined()
    if (!chosen) return
    expect(chosen.distanceTo(target.pos)).toBeGreaterThan(2 * R)
    expect(Math.abs(chosen.x)).toBeLessThanOrEqual(
      TableGeometry.tableX - 1.5 * R + 1e-6
    )
    expect(Math.abs(chosen.y)).toBeLessThanOrEqual(
      TableGeometry.tableY - 1.5 * R + 1e-6
    )
    expect(container.table.overlapsAny(chosen)).toBe(false)
  })

  it("parses difficulty and defaults to normal", () => {
    expect(parseBotDifficulty("easy")).toBe("easy")
    expect(parseBotDifficulty("hard")).toBe("hard")
    expect(parseBotDifficulty("normal")).toBe("normal")
    expect(parseBotDifficulty("")).toBe("normal")
    expect(parseBotDifficulty(null)).toBe("normal")
  })
})
