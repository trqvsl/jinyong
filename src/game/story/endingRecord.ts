import type { Player } from "../../types"
import {
  SHENDIAO_DEPARTURE_LABELS,
  SHENDIAO_ENDING_DEFINITIONS,
  SHENDIAO_ENDING_IDS,
  SHENDIAO_ENTRY_LABELS,
  SHENDIAO_HUAZHENG_LABELS,
  SHENDIAO_LIPING_LABELS,
  SHENDIAO_MARTIAL_PATH_LABELS,
  SHENDIAO_MARTIAL_RESULT_LABELS,
  SHENDIAO_ORDER_LABELS,
  SHENDIAO_RECORD_LABELS,
  SHENDIAO_TITLE_LABELS,
  SHENDIAO_VALUE_COST_LABELS,
  SHENDIAO_VALUE_LABELS,
  SHENDIAO_WITNESS_LABELS,
  type ShendiaoEndingId,
} from "../../data/story/shendiaoEndingRecords"

export interface EndingRecordFact {
  label: string
  value: string
}

export interface EndingRecordSection {
  id: "departure" | "council" | "value" | "martial" | "ending"
  order: number
  kicker: string
  title: string
  summary: string
  facts: EndingRecordFact[]
}

export interface ShendiaoEndingRecord {
  volumeId: "shendiao"
  volumeName: string
  endingId: ShendiaoEndingId
  endingTitle: string
  endingShortTitle: string
  endingSummary: string
  seal: string
  sections: EndingRecordSection[]
}

function labelFor(
  labels: Record<string, string>,
  value: string | undefined,
  fallback = "未留记录",
): string {
  if (!value) return fallback
  return labels[value] ?? value
}

function isShendiaoEndingId(value: string | undefined): value is ShendiaoEndingId {
  return !!value && SHENDIAO_ENDING_IDS.includes(value as ShendiaoEndingId)
}

export function getShendiaoEndingRecord(
  player: Player,
): ShendiaoEndingRecord | null {
  const arc = player.world.arcs.shendiao
  if (!arc?.beats["act8-huashan"]) return null

  const endingId = arc.variants["act8.ending"] ?? arc.ending
  if (!isShendiaoEndingId(endingId)) return null

  const definition = SHENDIAO_ENDING_DEFINITIONS[endingId]
  const variants = arc.variants
  const departure = labelFor(SHENDIAO_DEPARTURE_LABELS, variants["act7.departure"])
  const order = labelFor(SHENDIAO_ORDER_LABELS, variants["act7.order"])
  const record = labelFor(SHENDIAO_RECORD_LABELS, variants["act8.record"])
  const value = labelFor(SHENDIAO_VALUE_LABELS, variants["act8.value"])
  const martialPath = labelFor(
    SHENDIAO_MARTIAL_PATH_LABELS,
    variants["act8.martial-path"],
  )

  return {
    volumeId: "shendiao",
    volumeName: "射雕英雄传",
    endingId,
    endingTitle: definition.title,
    endingShortTitle: definition.shortTitle,
    endingSummary: definition.summary,
    seal: definition.seal,
    sections: [
      {
        id: "departure",
        order: 1,
        kicker: "第七幕存卷",
        title: "离营与军令",
        summary: `${departure}；${order}。`,
        facts: [
          { label: "离营结果", value: departure },
          { label: "屠城军令", value: order },
          {
            label: "华筝",
            value: labelFor(
              SHENDIAO_HUAZHENG_LABELS,
              variants["act7.huazheng"],
              "离营卷未另列",
            ),
          },
          {
            label: "李萍",
            value: labelFor(
              SHENDIAO_LIPING_LABELS,
              variants["act7.liping"],
              "离营卷未另列",
            ),
          },
        ],
      },
      {
        id: "council",
        order: 2,
        kicker: "华山公议原卷",
        title: "见证与公开记录",
        summary: `${record}，见证席保留各自能够担保的部分。`,
        facts: [
          {
            label: "入山身份",
            value: labelFor(
              SHENDIAO_ENTRY_LABELS,
              variants["act8.entry"],
              "入山名册未另列",
            ),
          },
          {
            label: "见证席",
            value: labelFor(
              SHENDIAO_WITNESS_LABELS,
              variants["act8.witnesses"],
              "见证席未另列",
            ),
          },
          { label: "公议原卷", value: record },
        ],
      },
      {
        id: "value",
        order: 3,
        kicker: "最后军报",
        title: "优先选择与代价",
        summary: `${value}；${labelFor(
          SHENDIAO_VALUE_COST_LABELS,
          variants["act8.value-cost"],
        )}。`,
        facts: [
          { label: "优先行动", value },
          {
            label: "必付代价",
            value: labelFor(
              SHENDIAO_VALUE_COST_LABELS,
              variants["act8.value-cost"],
            ),
          },
        ],
      },
      {
        id: "martial",
        order: 4,
        kicker: "绝顶石台名册",
        title: "武学行动与名次",
        summary: `${martialPath}，名册只记录真实完成的动作与见证。`,
        facts: [
          { label: "武学路径", value: martialPath },
          {
            label: "行动结果",
            value: labelFor(
              SHENDIAO_MARTIAL_RESULT_LABELS,
              variants["act8.martial"],
              "石台名册未另列",
            ),
          },
          {
            label: "隐藏称号",
            value: labelFor(
              SHENDIAO_TITLE_LABELS,
              variants["act8.title"],
              "不列名次",
            ),
          },
        ],
      },
      {
        id: "ending",
        order: 5,
        kicker: "江湖定席",
        title: definition.title,
        summary: definition.summary,
        facts: [
          { label: "最终归处", value: definition.title },
          {
            label: "卷结局同步",
            value: arc.ending === endingId
              ? "最终节点与卷结局一致"
              : "仅保留终局记录",
          },
          { label: "卷末印记", value: definition.seal },
        ],
      },
    ],
  }
}
