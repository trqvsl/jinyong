import { SHOP_ITEMS } from "../data/shop"
import type { Player } from "../types"

interface Props {
  player: Player
  onUpdate: (player: Player) => void
  onBack: () => void
}

export function ShopScreen({ player, onUpdate, onBack }: Props) {
  function buy(itemId: string) {
    const item = SHOP_ITEMS.find((entry) => entry.id === itemId)
    if (!item) return
    if (player.gold < item.price) {
      alert("银两不足，买不起这件货物。")
      return
    }

    const updated = item.apply({ ...player, gold: player.gold - item.price })
    onUpdate(updated)
    alert(`购入 ${item.name} 成功，已收入行囊。`)
  }

  return (
    <div className="shop-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="player-name">江湖商铺</span>
        <span className="day-info">银两 {player.gold}</span>
      </header>

      <section className="stat-panel">
        <h2>行囊状态</h2>
        <div className="stat-bars">
          <Bar label="气血" value={player.hp} max={player.hpMax} color="#c0392b" />
          <Bar label="内力" value={player.mp} max={player.mpMax} color="#2980b9" />
          <Bar label="经验" value={player.exp} max={player.expMax} color="#27ae60" />
        </div>
        <div className="shop-bag-preview">
          行囊物资：
          {Object.keys(player.inventory).length === 0
            ? " 暂无道具"
            : Object.entries(player.inventory).map(([itemId, count]) => ` ${itemId} x${count}`).join(" / ")}
        </div>
      </section>

      <section className="stat-panel">
        <h2>可购货品 <span className="panel-count">{SHOP_ITEMS.length}</span></h2>
        <div className="shop-list">
          {SHOP_ITEMS.map((item) => {
            const affordable = player.gold >= item.price
            return (
              <div key={item.id} className={`shop-item ${affordable ? "" : "sold-out"}`}>
                <div className="shop-item-main">
                  <div className="shop-item-head">
                    <span className="shop-item-cat">{item.category}</span>
                    <span className="shop-item-name">{item.name}</span>
                  </div>
                  <div className="shop-item-desc">{item.description}</div>
                  <div className="shop-item-effect">{item.effectText}</div>
                </div>
                <div className="shop-item-side">
                  <div className="shop-item-price">{item.price} 两</div>
                  <button className="menu-btn primary shop-buy-btn" disabled={!affordable} onClick={() => buy(item.id)}>
                    {affordable ? "购入" : "银两不足"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
      <span className="bar-value">{value}/{max}</span>
    </div>
  )
}
