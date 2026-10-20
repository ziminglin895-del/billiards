/**
 * Minimal i18n for player-facing strings.
 *
 * English is the key: `t("Hit")` returns "Hit" when no translation exists, so a
 * missing entry degrades to readable English rather than a blank control. Only
 * non-English locales are stored, which keeps English from drifting out of sync
 * with the source strings it is keyed by.
 *
 * Locale selection order: `?locale=` query param (for testing and for sharing a
 * link in a given language), then the browser's preferred languages, then
 * English. Set `document.documentElement.lang` on load so assistive technology
 * announces the strings with the correct voice.
 *
 * Chinese ships as a single `zh` dictionary in Simplified characters: every
 * `zh-*` tag (zh-CN, zh-TW, zh-HK, zh-Hans, zh-Hant) matches on the language
 * subtag alone, so Traditional-browser visitors read Simplified too rather than
 * falling back to English. `zh-CN` is advertised to the document so the
 * browser resolves Han-unified glyphs to Simplified forms instead of guessing
 * from the region.
 */

export const LOCALES = ["ko", "zh"] as const

export type Locale = (typeof LOCALES)[number]

const translations: Record<Locale, Record<string, string>> = {
  ko: {
    // Button labels are short by design. "Hit" is the shooting action; "Place
    // Ball" keeps the newline so the button still breaks across two lines.
    Hit: "공치기",
    "Place\nBall": "공놓기",
    // Notification dialog buttons and title headings. Dialog bodies (the
    // subtext) still stay in the source language. Where a label reads
    // naturally with a different word order, `{name}` placeholders keep the
    // English source grammatical while the translation stays native.
    "Back to Lobby": "로비로 돌아가기",
    "Back to Arena": "아레나로 돌아가기",
    // Arena upload in flight: the button is inert until the result is sent.
    "Uploading result…": "결과 업로드 중…",
    "New Game": "새 게임",
    Replay: "다시보기",
    Rematch: "재대결",
    // Foul badge: the opponent may place the cue ball anywhere before the
    // next shot. "자유구" is the established Korean billiards term.
    "Ball in hand": "자유구",
    // Bot-mode info badge: the player breaks/shoots first (선공 vs 선후공).
    "You first": "선공",
    // Points-race length (three-cushion/sagu): first to reach {score} points
    // wins, written in the Korean "선취 N점" style.
    "Race to: {score}": "선취 {score}점",
    // Notification titles (dialog headings). "파울" is the term Korean
    // billiards players actually use for a foul; "경기" (match) reads better
    // than "게임" for these headings.
    FOUL: "파울",
    "YOU WON": "승리",
    "YOU LOST": "패배",
    "GAME OVER": "경기 종료",
    "Concede Game": "경기 기권",
    "Replay Complete": "다시보기 완료",
    "Waiting for opponent to join": "상대 입장 대기 중",
    // Concede confirmation.
    Concede: "기권",
    "Play on": "계속하기",
    // Three-cushion break prompt: stop and take the win, or carry the run on.
    "Declare win": "승리 선언",
    "Continue break": "이어서 치기",
    // Reveal (card game) game over.
    "Update Deck": "덱 바꾸기",
    // Banner controls.
    "Share replay link": "리플레이 링크 공유",
    share: "공유",
    upload: "업로드",
    "Break : {score}": "브레이크: {score}",
    "Open high break {score}": "하이브레이크 {score} 보기",
  },
  zh: {
    Hit: "击球",
    "Place\nBall": "摆球",
    "Back to Lobby": "返回大厅",
    "Back to Arena": "返回竞技场",
    "Uploading result…": "正在上传结果…",
    "New Game": "新游戏",
    Replay: "回放",
    Rematch: "再来一局",
    "Ball in hand": "自由球",
    "You first": "你先开球",
    "Race to: {score}": "先到 {score} 分",
    FOUL: "犯规",
    "YOU WON": "你赢了",
    "YOU LOST": "你输了",
    "GAME OVER": "本局结束",
    "Concede Game": "认输",
    "Replay Complete": "回放结束",
    "Waiting for opponent to join": "等待对手加入",
    Concede: "认输",
    "Play on": "继续比赛",
    "Declare win": "宣布胜利",
    "Continue break": "继续连击",
    "Update Deck": "更换牌组",
    "Share replay link": "分享回放链接",
    share: "分享",
    upload: "上传",
    "Break : {score}": "单杆：{score}",
    "Open high break {score}": "查看最高单杆 {score}",
    "Cue ball potted": "白球落袋",
    "No ball hit": "没有碰到任何球",
    "Wrong ball hit first": "先碰到了错误的球",
    "No cushion after contact": "碰球后没有球碰库",
    "Hitting the 8-ball first is a foul": "先碰 8 号球犯规",
    "Wrong group hit first": "先碰错花色",
    "Must hit 8-ball first": "必须先碰 8 号球",
    "8-ball pocketed on foul": "犯规时打进 8 号球",
    "8-ball pocketed early": "8 号球提前落袋",
    "opponent conceded": "对手认输",
    "You conceded": "你已认输",
  },
}

// Document language, when the locale code alone is too coarse for the browser
// to pick the right script: `zh` is Simplified here, so advertise `zh-CN`.
const HTML_LANG: Partial<Record<Locale, string>> = { zh: "zh-CN" }

function fromTag(tag: string | undefined | null): Locale | undefined {
  if (!tag) return undefined
  const language = tag.toLowerCase().split("-")[0]
  return LOCALES.find((locale) => locale === language)
}

function fromBrowser(): Locale | undefined {
  const tags = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]
  for (const tag of tags) {
    const locale = fromTag(tag)
    if (locale) return locale
  }
  return undefined
}

let resolved: Locale | undefined

/** Current locale, or undefined when English is in use. */
export function currentLocale(): Locale | undefined {
  if (resolved === undefined) {
    const requested = new URLSearchParams(location.search).get("locale")
    // An explicit ?locale= is authoritative: one we do not ship resolves to
    // English rather than silently falling back to the browser language, which
    // would make the result depend on the visitor's OS.
    // A page that pins its own language (e.g. zh.html) sets data-locale on the
    // root element so it stays Chinese even on an English browser.
    const pinned =
      typeof document !== "undefined"
        ? document.documentElement.dataset.locale
        : undefined
    resolved = requested
      ? fromTag(requested)
      : (fromTag(pinned) ?? fromBrowser())
  }
  return resolved
}

/**
 * Translate an English source string, falling back to the string itself.
 * Optional `params` fill `{name}` placeholders (e.g. a score).
 */
export function t(
  key: string,
  params?: Record<string, string | number>
): string {
  const locale = currentLocale()
  const template = (locale && translations[locale]?.[key]) || key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match
  )
}

if (typeof document !== "undefined") {
  const locale = currentLocale()
  document.documentElement.lang = locale ? (HTML_LANG[locale] ?? locale) : "en"
}
