import { useEffect, useMemo, useRef, useState } from "react";
import { cardConfig } from "../data/config.js";

// Preserve every character and paragraph; split at nearby sentence endings when possible.
export function paginateLetter(text, limit = cardConfig.charactersPerPage) {
  const units = [...new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(text)].map(unit => unit.segment);
  const pages = [];
  const size = Math.max(40, limit);
  while (units.length > size) {
    let cut = size;
    for (let i = size - 1; i >= Math.floor(size * .55); i--) {
      if (/[。！？\n]/.test(units[i])) { cut = i + 1; break; }
    }
    pages.push(units.splice(0, cut).join(""));
  }
  if (units.length || !pages.length) pages.push(units.join(""));
  return pages;
}

export default function LetterCard({ birthday, onContinue, continueLabel }) {
  const pages = useMemo(() => {
    const manual = birthday.cardPages?.filter(page => typeof page === "string" && page.trim());
    return manual?.length ? manual : paginateLetter(birthday.personalMessage || "");
  }, [birthday.cardPages, birthday.personalMessage]);
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState(null);
  const pageRef = useRef(null);
  const busy = useRef(false);
  useEffect(() => {
    if (!turn) return;
    const middle = setTimeout(() => {
      setPage(turn.target);
      if (pageRef.current) pageRef.current.scrollTop = 0;
    }, cardConfig.flipMs / 2);
    const done = setTimeout(() => { setTurn(null); busy.current = false; pageRef.current?.focus({ preventScroll: true }); }, cardConfig.flipMs);
    return () => { clearTimeout(middle); clearTimeout(done); };
  }, [turn]);
  const flip = direction => {
    const target = page + direction;
    if (busy.current || target < 0 || target >= pages.length) return;
    busy.current = true;
    setTurn({ target, direction });
  };
  return <>
    <div className="letter-book" style={{ "--flip-duration": `${cardConfig.flipMs}ms` }}>
      <article className={`evol-letter ${turn ? `letter-turning ${turn.direction < 0 ? "turn-back" : ""}` : ""}`}>
        <small>JUST FOR YOU · FROM {birthday.senderName}</small>
        <h3>{birthday.birthdayTitle}</h3>
        {page === 0 && <><p>{birthday.streamerName}へ</p><strong>{birthday.mainMessage}</strong></>}
        <div ref={pageRef} className="letter-page-body" tabIndex={0} role="region" aria-label={`カード本文 ${page + 1} ページ`}><p className="personal-letter">{pages[page]}</p></div>
        {page === pages.length - 1 && <span className="letter-signature">With love, {birthday.senderName} ♡</span>}
        <small className="letter-page-number" aria-live="polite">{page + 1} / {pages.length}</small>
      </article>
    </div>
    {pages.length > 1 && <nav className="letter-pagination" aria-label="カードのページ">
      <button type="button" disabled={page === 0 || !!turn} onClick={() => flip(-1)}>← 前のページ</button>
      <span>ゆっくり読んでね</span>
      <button type="button" disabled={page === pages.length - 1 || !!turn} onClick={() => flip(1)}>次のページ →</button>
    </nav>}
    {page === pages.length - 1 && !turn && <button className="twitch-primary" onClick={onContinue}>{continueLabel}</button>}
  </>;
}
