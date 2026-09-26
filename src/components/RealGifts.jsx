import { realGiftConfig as config } from "../data/config.js";

export default function RealGifts({ selected, opened, onSelect, onContinue }) {
  const gift = config.gifts.find(item => item.id === selected);
  const complete = config.gifts.every(item => opened.includes(item.id));
  return <>
    <p className="unboxing-subtitle">{config.intro}</p>
    <div className="real-gift-choices">
      {config.gifts.map(item => <button key={item.id} className={selected === item.id ? "selected" : ""} aria-pressed={selected === item.id} onClick={() => onSelect(item)}>
        <span aria-hidden="true">{item.icon}</span><small>{item.recipient}</small><strong>ひみつの贈りもの</strong><em>{opened.includes(item.id) ? "✓ HINT READ" : "TAP TO READ A CLUE"}</em>
      </button>)}
    </div>
    {gift && <article key={gift.id} className="real-gift-detail" aria-live="polite">
      <div className="mystery-gift-visual" aria-hidden="true">？<span>♡</span></div>
      <h3>{gift.recipient}</h3><p className="gift-recipient-reply">「{gift.reply}」</p><p className="gift-hint">ヒント：{gift.hint}</p><p>{gift.message}</p><small>From EvoL ♡</small>
    </article>}
    <p className="real-gift-progress">{opened.length} / {config.gifts.length} OPENED</p>
    {complete ? <button className="twitch-primary" onClick={onContinue}>{config.continueLabel}</button> : <p className="unboxing-subtitle">{gift ? "もうひとつのカードも開けてみてね。" : "どちらから開けてもいいよ。"}</p>}
  </>;
}
