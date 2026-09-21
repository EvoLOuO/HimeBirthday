import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StreamPreview from "./StreamPreview.jsx";
import { birthdayConfig as birthday } from "../data/birthday.js";
import { unboxingConfig as config, endingConfig } from "../data/config.js";
import useTwitchChat from "./useTwitchChat.js";
import LetterCard from "./LetterCard.jsx";
import EndingKeepsake from "./EndingKeepsake.jsx";

export function TwitchMark() {
  return <svg viewBox="0 0 24 26" aria-hidden="true"><path fill="currentColor" d="M3 0 0 5v17h6v4l4-4h5l9-9V0H3Zm19 12-4 4h-6l-4 4v-4H3V2h19v10Z"/><path fill="currentColor" d="M10 5h2v7h-2zm6 0h2v7h-2z"/></svg>;
}

export default function TwitchRoom({ deliveries }) {
  const audience = useMemo(() => deliveries.filter(item => !item.featured), [deliveries]);
  const [stage, setStage] = useState("AUDIENCE");
  const [shown, setShown] = useState(-1);
  const [replyVisible, setReplyVisible] = useState(false);
  const [bubble, setBubble] = useState({ id: 0, text: config.intro, duration: 4000 });
  const [reaction, setReaction] = useState(0);
  const [hasOpenedGift, setHasOpenedGift] = useState(false);
  const [farewellComplete, setFarewellComplete] = useState(false);
  const [farewellLines, setFarewellLines] = useState([]);
  const titleRef = useRef(null);
  const stageRef = useRef(null);
  const endingFrame = useRef(null);
  const ended = useRef(false);
  const { messages, viewers, addMessage, clearMessages } = useTwitchChat(stage);
  const currentGift = audience[shown];
  const move = useCallback((next, text) => {
    setStage(next);
    setReaction(value => value + 1);
    const reply = text || (next === "DESK" ? config.audienceClosing : null);
    if (reply) setBubble({ id: Date.now(), text: reply, duration: 4000 });
    const evolLines = { DESK: "次は僕の番だね。まずはお手紙から💌", CARD: "ちょっと照れるけど…読んでもらえたらうれしい。", GIFT: "もうひとつ、開けてみて👀", FINAL: "続きは実物で。楽しみにしててね♡" };
    if (evolLines[next]) addMessage("EvoL", evolLines[next]);
  }, [addMessage]);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [stage]);
  useEffect(() => {
    if (!bubble) return;
    const timer = setTimeout(() => setBubble(null), bubble.duration);
    return () => clearTimeout(timer);
  }, [bubble]);
  useEffect(() => {
    if (stage !== "FINAL" || farewellComplete) return;
    setFarewellLines([]);
    const timers = [];
    endingConfig.chat.forEach((line, index) => timers.push(setTimeout(() => {
      if (index === 0) clearMessages();
      addMessage(line.username, line.message, true);
    }, endingConfig.giftLeadMs + index * endingConfig.chatGapMs)));
    const speechAt = endingConfig.giftLeadMs + endingConfig.chat.length * endingConfig.chatGapMs;
    endingConfig.farewell.forEach((text, index) => timers.push(setTimeout(() => {
      setFarewellLines(old => [...old, text]);
      // Keep the line visible slightly past the hand-off to the next line so two
      // timers cannot clear the replacement bubble on the same tick.
      setBubble({ id: `goodbye-${index}`, text, duration: endingConfig.farewellLineMs + 300 });
      setReaction(value => value + 1);
    }, speechAt + index * endingConfig.farewellLineMs)));
    timers.push(setTimeout(() => setFarewellComplete(true), speechAt + endingConfig.farewell.length * endingConfig.farewellLineMs));
    return () => timers.forEach(clearTimeout);
  }, [stage, farewellComplete, addMessage, clearMessages]);
  useEffect(() => {
    if (stage !== "AUDIENCE") return;
    setReplyVisible(false);
    let replyTimer;
    const item = audience[shown];
    if (item) {
      const text = item.streamerReply || `${item.username} さん、${item.gift}とカード、あにがと〜！`;
      setBubble({ id: `audience-${item.id}`, text, duration: config.audienceItemMs });
      setReaction(value => value + 1);
      addMessage(birthday.streamerName, text);
      replyTimer = setTimeout(() => {
        setReplyVisible(true);
        addMessage(item.username, item.chatReply || item.message);
      }, Math.min(config.audienceReplyDelayMs, config.audienceItemMs - 200));
    }
    const timer = setTimeout(() => {
      if (shown + 1 < audience.length) setShown(value => value + 1);
      else move("DESK");
    }, shown < 0 ? config.audienceIntroMs : config.audienceItemMs);
    return () => { clearTimeout(timer); clearTimeout(replyTimer); };
  }, [stage, shown, audience, addMessage, move]);
  const endStream = () => {
    if (!farewellComplete || ended.current) return;
    ended.current = true;
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) endingFrame.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    setBubble(null);
    setStage("ENDED");
  };
  const titles = { AUDIENCE: "みんなからの贈りもの", DESK: "最後は、EvoL から。", CARD: "一通ずつ、大切に。", GIFT: "もうひとつの、ひみつ。", FINAL: config.finalTitle };
  if (stage === "ENDED") return <EndingKeepsake sourceFrame={endingFrame.current}/>;
  return <main className={`twitch-page ${stage === "FINAL" ? "twitch-farewell" : ""}`}>
    <header className="twitch-nav"><div className="twitch-wordmark"><TwitchMark/> Twitch</div><span>BIRTHDAY UNBOXING</span><div className="twitch-user">h</div></header>
    <div className="twitch-layout">
      <section className="twitch-broadcast" aria-label="Twitch ライブ">
        <div ref={stageRef} className="twitch-stage live">
          <StreamPreview bubble={bubble} reaction={reaction} expression={stage === "FINAL" ? "birthday" : "gift"}/>
          <span className="twitch-live-label">LIVE</span><span className="twitch-stage-label">お誕生日の開封配信 🎁</span>
        </div>
        <div className="twitch-channel"><div className="twitch-user">h</div><div><h1>{birthday.streamerName}</h1><p>みんなのプレゼント、ひとつずつ。💜</p><small>雑談 · 日本語 · Birthday</small></div><span className="twitch-viewers" aria-label="視聴者数">● {viewers.toLocaleString("en-US")} <small>視聴中</small></span></div>
        <div className="twitch-recap"><div className="twitch-chat-heading"><small>STREAM CHAT</small><span>{stage === "FINAL" ? "♡ SEE YOU NEXT TIME" : "● LIVE CHAT"}</span></div><div className="twitch-chat-messages" role="log" aria-label="配信チャット" aria-live="polite" aria-relevant="additions">
          {messages.map(line => <p key={line.id} className={`${line.username === "EvoL" ? "twitch-evol" : line.username === birthday.streamerName ? "twitch-streamer" : ""} ${line.farewell ? "farewell-line" : ""}`}><b>{line.username}{line.username === "EvoL" ? " ✦" : ""}</b><span>{line.message}</span></p>)}
        </div></div>
      </section>
      <section className={`unboxing-panel unboxing-${stage.toLowerCase()}`} aria-label="プレゼント開封">
        <div className="unboxing-topline"><span>AFTER THE PARTY</span><span>{stage === "AUDIENCE" ? "01 / 03" : ["DESK", "CARD"].includes(stage) ? "02 / 03" : "03 / 03"}</span></div>
        <h2 ref={titleRef} tabIndex={-1}>{titles[stage]}</h2>
        {stage === "AUDIENCE" && <>
          <p className="unboxing-subtitle">届いたプレゼントを、さっそく開封！</p>
          <div className="audience-conversation" aria-live="polite" aria-label="開封の会話">
            <div className="audience-gift-prop" key={currentGift?.id || "intro"}><span>{currentGift?.icon || "🎁"}</span><small>{currentGift ? `${currentGift.username} · ${currentGift.gift} ＋ 💌` : "みんなから届いた贈りもの"}</small></div>
            <div className="unboxing-dialogue streamer-dialogue"><b>{birthday.streamerName} <small>配信者</small></b><p>{currentGift ? currentGift.streamerReply || `${currentGift.username} さん、${currentGift.gift}とカード、あにがと〜！` : config.intro}</p></div>
            {currentGift && replyVisible && <div key={`reply-${currentGift.id}`} className="unboxing-dialogue viewer-dialogue"><b>{currentGift.username}</b><p>{currentGift.chatReply || currentGift.message}</p></div>}
          </div>
          <div className="audience-progress" aria-label="開封進捗">{audience.map((item, index) => <span key={item.id} className={index === shown ? "current" : index < shown ? "opened" : ""}>{index < shown ? "✓" : item.icon}</span>)}<small>{Math.max(0, shown + 1)} / {audience.length}</small></div>
          <button className="twitch-primary" onClick={() => move("DESK")}>EvoL のプレゼントへ →</button>
        </>}
        {stage === "DESK" && <>
          <p className="unboxing-subtitle">このお手紙は、ゆっくり読もう。<br/>封筒をタップして開けてね。</p>
          <button className="evol-envelope" aria-label="EvoL のカードを開く" onClick={() => move("CARD", config.cardReply)}><span className="envelope-flap"/><span className="envelope-seal">♡</span><span className="envelope-address">To {birthday.streamerName}<b>From {birthday.senderName}</b></span><span className="object-hint">TAP TO OPEN</span></button>
          <div className="waiting-gift"><span>🎁</span><p>プレゼントは、お手紙のあとで。</p></div>
        </>}
        {stage === "CARD" && <>
          <LetterCard birthday={birthday} onContinue={() => move(hasOpenedGift ? "FINAL" : "GIFT", hasOpenedGift ? null : config.giftReply)} continueLabel={hasOpenedGift ? "プレゼントの案内に戻る →" : "読んだよ。次はプレゼント →"}/>
        </>}
        {stage === "GIFT" && <>
          <p className="unboxing-subtitle">From {birthday.senderName}<br/>{birthday.realGiftMessage}</p>
          <button className="evol-parcel" aria-label="EvoL のプレゼントを開く" onClick={() => { setHasOpenedGift(true); move("FINAL", "えっ、実物があるの！？見にいかなきゃ！"); }}><span className="parcel-bow">୨୧</span><span className="parcel-box"><i/><b>for you ♡</b></span><span className="object-hint">TAP TO UNWRAP</span></button>
        </>}
        {stage === "FINAL" && <>
          <div className="real-gift-icon" aria-hidden="true">🎁<span>↗</span></div><small className="real-gift-label">YOUR REAL GIFT IS WAITING</small>
          <p className="real-gift-message">{config.finalMessage}</p><p className="letter-signature">From {birthday.senderName} ♡</p>
          <section className="farewell-panel" aria-label="配信のごあいさつ" aria-live="polite">
            <small>{farewellComplete ? endingConfig.readyHint : endingConfig.closingHint}</small>
            {farewellLines.map(text => <p key={text}>{text}</p>)}
          </section>
          {farewellComplete && <button className="end-stream-button" onClick={endStream}>{endingConfig.endButton} <span aria-hidden="true">♡</span></button>}
          <button className="twitch-secondary" onClick={() => move("CARD", config.cardReply)}>カードをもう一度読む</button>
        </>}
      </section>
    </div>
  </main>;
}
