import { useState } from "react"
import { Coins, PackageCheck, ShoppingBag } from "lucide-react"
import { SHOP_ITEMS } from "../data/shop"
import { getItemById } from "../data/items"
import type { Player } from "../types"
import { ItemArtwork } from "./ItemArtwork"

interface Props {
  player: Player
  onUpdate: (player: Player) => void
  onBack: () => void
  shopName?: string
  shopkeeper?: string
}

function getShopRecommendation(player: Player): { title: string; detail: string; focusItemId?: string } {
  const hpCount = player.inventory["small-hp-pill"] ?? 0
  const mpCount = player.inventory["small-mp-pill"] ?? 0
  const rationCount = player.inventory["field-ration"] ?? 0
  const hpRatio = player.hp / Math.max(1, player.hpMax)
  const mpRatio = player.mp / Math.max(1, player.mpMax)

  if (hpRatio < 0.55 && hpCount < 2) {
    return {
      title: "先补金疮药",
      detail: "你当前气血偏低，且血药储备不多，先买 1~2 份伤药更稳妥。",
      focusItemId: "small-hp-pill",
    }
  }

  if (mpRatio < 0.55 && mpCount < 2) {
    return {
      title: "先补养气散",
      detail: "你当前内力偏低，若准备继续赶路或打架，先备一些养气散更合适。",
      focusItemId: "small-mp-pill",
    }
  }

  if (rationCount < 2) {
    return {
      title: "可补干粮包",
      detail: "干粮包同时回气血与内力，适合赶路前做通用整备。",
      focusItemId: "field-ration",
    }
  }

  if (hpCount + mpCount + rationCount >= 6) {
    return {
      title: "补给暂时充足",
      detail: "你手头药品已经够用，当前更适合继续主线或先整理人物面板。",
    }
  }

  return {
    title: "可少量备药",
    detail: "若打算连跑几段剧情，可顺手补 1 份伤药或养气散，保持行囊稳定。",
  }
}

export function ShopScreen({
  player,
  onUpdate,
  onBack,
  shopName = "江湖商铺",
  shopkeeper,
}: Props) {
  const recommendation = getShopRecommendation(player)
  const [notice, setNotice] = useState("")

  function buy(itemId: string) {
    const item = SHOP_ITEMS.find((entry) => entry.id === itemId)
    if (!item) return
    if (player.gold < item.price) {
      setNotice("银两不足，柜上的货物不能赊账。")
      return
    }

    const updated = item.apply({ ...player, gold: player.gold - item.price })
    onUpdate(updated)
    setNotice(`${shopkeeper ? `${shopkeeper}把` : ""}${item.name}包好，已经收入行囊。`)
  }

  return (
    <div className="shop-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="player-name">{shopName}</span>
        <span className="day-info">银两 {player.gold}</span>
      </header>

      {shopkeeper && (
        <section className="shopkeeper-strip">
          <div className="shopkeeper-mark"><ShoppingBag size={22} /></div>
          <div>
            <span>{shopkeeper}</span>
            <p>柜上只摆日常伤药与干粮。银货两讫，买下的东西直接收入行囊。</p>
          </div>
        </section>
      )}

      {notice && <div className="shop-inline-notice" role="status">{notice}</div>}

      <section className="shop-status-band">
        <div className="shop-vitals">
          <div>
            <span>气血</span>
            <strong>{player.hp}<small> / {player.hpMax}</small></strong>
          </div>
          <div>
            <span>内力</span>
            <strong>{player.mp}<small> / {player.mpMax}</small></strong>
          </div>
          <div>
            <span>银两</span>
            <strong>{player.gold}<small> 两</small></strong>
          </div>
        </div>
        <div className="shop-bag-preview">
          <PackageCheck size={18} />
          <span>
            {Object.keys(player.inventory).length === 0
              ? "行囊暂无物资"
              : Object.entries(player.inventory)
                  .filter(([, count]) => count > 0)
                  .map(([itemId, count]) => `${getItemById(itemId)?.name ?? itemId} × ${count}`)
                  .join(" · ")}
          </span>
        </div>
      </section>

      <section className="shop-recommend-panel">
        <div className="shop-recommend-head">
          <div className="shop-recommend-label">当前建议</div>
          {recommendation.focusItemId && <span className="shop-recommend-badge">优先补给</span>}
        </div>
        <div className="shop-recommend-title">{recommendation.title}</div>
        <p className="shop-recommend-copy">{recommendation.detail}</p>
      </section>

      <section className="shop-goods-section">
        <div className="shop-section-heading">
          <h2>柜上货物</h2>
          <span>{SHOP_ITEMS.length} 件</span>
        </div>
        <div className="shop-list">
          {SHOP_ITEMS.map((item) => {
            const itemDef = getItemById(item.grantItemId)
            const affordable = player.gold >= item.price
            const isRecommended = recommendation.focusItemId === item.id
            return (
              <article key={item.id} className={`shop-item ${affordable ? "" : "sold-out"}${isRecommended ? " recommended" : ""}`}>
                <div className="shop-item-art">
                  {itemDef && <ItemArtwork item={itemDef} />}
                  <span>{item.category}</span>
                </div>
                <div className="shop-item-main">
                  <div className="shop-item-head">
                    <span className="shop-item-name">{item.name}</span>
                    {isRecommended && <span className="shop-item-recommend">当前建议</span>}
                  </div>
                  <div className="shop-item-desc">{item.description}</div>
                  <div className="shop-item-effect">{item.effectText}</div>
                  <div className="shop-item-owned">行囊已有 {player.inventory[item.grantItemId] ?? 0}</div>
                </div>
                <div className="shop-item-side">
                  <div className="shop-item-price"><Coins size={16} /> {item.price} 两</div>
                  <button className="menu-btn primary shop-buy-btn" disabled={!affordable} onClick={() => buy(item.id)}>
                    {affordable ? "购入" : "银两不足"}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
