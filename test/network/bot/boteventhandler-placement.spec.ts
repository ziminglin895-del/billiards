import { Vector3 } from "three"
import { Container } from "../../../src/container/container"
import { Ball, State } from "../../../src/model/ball"
import { R } from "../../../src/model/physics/constants"
import { Session } from "../../../src/network/client/session"
import { BotEventHandler } from "../../../src/network/bot/boteventhandler"
import { Logger } from "../../../src/network/bot/logger"
import { PlaceBallEvent } from "../../../src/events/placeballevent"
import { AimEvent } from "../../../src/events/aimevent"
import { GameEvent } from "../../../src/events/gameevent"
import { EventType } from "../../../src/events/eventtype"
import { Assets } from "../../../src/view/assets"
import { initDom } from "../../view/dom"

initDom()

describe("BotEventHandler ball in hand", () => {
  it("moves the cue ball to a chosen position before aiming", () => {
    Ball.id = 0
    Session.init("test-client", "TestPlayer", "test-table", false)
    const container = new Container({
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
    const cueball = container.table.cueball
    const target = container.table.balls[9]
    container.recorder.entries.push({
      event: { type: EventType.AIM },
    } as any)
    cueball.pos.set(-0.6, 0, 0)
    target.pos.set(0.45, 0.18, 0)

    const published: GameEvent[] = []
    const handler = new BotEventHandler(
      new Logger(),
      container,
      (events) => published.push(...events),
      () => {}
    )
    const requested = new Vector3(-0.6, 0, 0)
    handler.handle(new PlaceBallEvent(requested, undefined, true))

    const aim = published.find((event) => event instanceof AimEvent) as
      AimEvent | undefined
    expect(aim).toBeDefined()
    if (!aim) return
    expect(aim.pos.distanceTo(target.pos)).toBeGreaterThan(2 * R)
    expect(aim.pos.distanceTo(requested)).toBeGreaterThan(R)
    expect(container.table.overlapsAny(aim.pos)).toBe(false)
  })
})
