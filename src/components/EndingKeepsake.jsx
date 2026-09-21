import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { birthdayConfig as birthday } from "../data/birthday.js";
import { endingConfig as ending, flinConfig } from "../data/config.js";
import StreamPreview from "./StreamPreview.jsx";

export default function EndingKeepsake({ sourceFrame }) {
  const [furinVisible, setFurinVisible] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const photoRef = useRef(null);
  const headingRef = useRef(null);
  useLayoutEffect(() => {
    if (window.scrollY > 0) window.scrollTo(0, 0);
    const photo = photoRef.current;
    const target = photo?.getBoundingClientRect();
    // Carry the visible broadcast frame into the keepsake; use a gentle zoom when it was offscreen.
    if (target?.width && sourceFrame?.width && sourceFrame.top + sourceFrame.height > 0 && sourceFrame.top < window.innerHeight) {
      photo.style.setProperty("--photo-from-x", `${sourceFrame.left - target.left}px`);
      photo.style.setProperty("--photo-from-y", `${sourceFrame.top - target.top}px`);
      photo.style.setProperty("--photo-from-scale-x", sourceFrame.width / target.width);
      photo.style.setProperty("--photo-from-scale-y", sourceFrame.height / target.height);
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [sourceFrame]);
  useEffect(() => {
    const timer = setTimeout(() => setFurinVisible(true), ending.furinDelayMs);
    return () => clearTimeout(timer);
  }, []);
  return <main className="ending-page" style={{ "--keepsake-duration": `${ending.keepsakeMs}ms` }}>
    <div className="ending-orbit orbit-one" aria-hidden="true"/><div className="ending-orbit orbit-two" aria-hidden="true"/>
    <section className="ending-content" aria-label="バースデー配信の記念カード">
      <span className="ending-kicker">STREAM ENDED · MEMORIES SAVED IN OUR HEARTS</span>
      <h1 ref={headingRef} tabIndex={-1}>{ending.title}</h1>
      <p className="ending-subtitle">今日の「ありがとう」を、これからも。</p>
      <div className="keepsake-shell">
        <figure className="birthday-keepsake">
          <span className="keepsake-tape" aria-hidden="true"/>
          <div ref={photoRef} className="keepsake-photo twitch-stage live">
            <StreamPreview bubble={null} reaction={0}/>
            <span className="keepsake-photo-label">HAPPY BIRTHDAY ♡</span>
            <span className="keepsake-sparkle" aria-hidden="true">✦</span>
          </div>
          <figcaption><small>TIKTOK → TWITCH · A LITTLE BIRTHDAY MEMORY</small><h2>{birthday.streamerName}’s<br/>birthday live</h2><p>{ending.keepsakeCaption}</p><span>with love, {birthday.senderName} ♡</span></figcaption>
        </figure>
        {furinVisible && <aside className="farewell-furin" aria-label="フリンが「またね」の紙をくわえて顔を出しています" role="status">
          <div className="farewell-furin-photo">{imageFailed ? <span className="farewell-dog-fallback" role="img" aria-label="フリン">🐶</span> : <img src={flinConfig.image} alt={flinConfig.name} style={{ objectPosition: flinConfig.imagePosition }} onError={() => setImageFailed(true)}/>}</div>
          <span className="furin-paper"><i aria-hidden="true"/>{ending.furinNote}<small>♡</small></span>
          <span className="farewell-furin-name">FURIN</span>
        </aside>}
      </div>
      <p className="ending-real-gift">{ending.realGiftReminder}</p>
      <span className="ending-last-heart" aria-hidden="true">♡</span>
    </section>
  </main>;
}
