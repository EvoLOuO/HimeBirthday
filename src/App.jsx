import { useState } from "react";
import StreamPreview from "./components/StreamPreview.jsx";
import Entry from "./components/Entry.jsx";
import Flin from "./components/Flin.jsx";
import BirthdayDecorations from "./components/BirthdayDecorations.jsx";
import { birthdayConfig as config } from "./data/birthday.js";
import { LIKE_GOAL, GIFT_GOAL, gifts, evolEvent } from "./data/config.js";
import TwitchRoom, { TwitchMark } from "./components/TwitchRoom.jsx";
import { openingChat, unboxingConfig, handoffConfig, tiktokConfig } from "./data/config.js";
import useLive from "./useLive.js";
export default function App() {
  const [screen, setScreen] = useState("HOME");
  if (screen !== "LIVE")
    return (
      <Entry
        screen={screen}
        onOpen={() => setScreen("DISCOVER")}
        onBack={() => setScreen("HOME")}
        onEnter={() => setScreen("LIVE")}
      />
    );
  return <LiveRoom />;
}
function LiveRoom() {
  const live = useLive();
  const {
    phase,
    likes,
    giftCount,
    bubble,
    reaction,
    expression,
    hearts,
    giftEffect,
    countdown,
    chat,
    activity,
    spotlight,
    flinState,
    flinResponse,
  } = live;
  const [panel, setPanel] = useState(false),
    [message, setMessage] = useState("");
  const goalVisible = [
      "GIFT_EVENT",
      "GIFT_COMPLETE",
      "FLIN_ACTIVATING",
    ].includes(phase),
    blocked = [
      "HANDOFF",
      "CLOSING",
      "ENDING",
      "JOINING_TWITCH",
      "GIFT_COMPLETE",
      "FLIN_ACTIVATING",
      "BIRTHDAY_COUNTDOWN",
      "BIRTHDAY",
    ].includes(phase);
  if (phase === "TWITCH") return <TwitchRoom deliveries={live.deliveries} />;
  return (
    <main className="page">
      <section
        className={`live ${phase === "BIRTHDAY" ? "celebrating" : ""} phase-${phase.toLowerCase()}`}
        aria-label="バーチャルライブ配信"
      >
        <header className="live-header">
          <div className="profile">h</div>
          <div className="identity">
            <strong>
              {config.streamerName} <span className="live-badge">LIVE</span>
            </strong>
            <small>@{config.username}</small>
          </div>
          <div className="viewers" aria-label="TikTok 視聴者数">◉ {tiktokConfig.viewers.toLocaleString("en-US")}</div>
          <span className="menu" aria-hidden="true">
            •••
          </span>
        </header>
        <div className="topic">
          <span /> まったりお話ししよ〜 <span className="tag">雑談</span>
        </div>
        <StreamPreview
          bubble={bubble}
          reaction={reaction}
          expression={expression}
        />
        <Flin state={flinState} response={flinResponse} onTap={live.tapFlin} />
        {phase === "BIRTHDAY" && live.deliveries.length > 0 && (
          <section className="birthday-inbox" aria-label="届いたプレゼント" aria-live="polite">
            <small>BIRTHDAY INBOX · {live.deliveries.length}</small>
            {live.deliveries.map(item => <div key={item.id} className={item.featured ? "featured-delivery" : ""}><span>{item.icon}</span><p><b>{item.username}</b><small>{item.gift} ＋ カードが届きました 💌</small></p></div>)}
          </section>
        )}
        {phase === "CLOSING" && <div className="closing-note">このあと、Twitch で開封配信 💜</div>}
        {phase === "ENDING" && <section className="stream-ended" style={{ "--end-fade": `${handoffConfig.fadeMs}ms` }} aria-live="polite"><span>♡</span><h2>{handoffConfig.endedTitle}</h2><p>{handoffConfig.endedMessage}</p></section>}
        {["HANDOFF", "JOINING_TWITCH"].includes(phase) && (
          <section className="platform-handoff" aria-label="Twitch へのお引っ越し">
            <span className="handoff-kicker">TikTok LIVE · 配信終了</span>
            <div className="handoff-mark"><TwitchMark/></div>
            <h1>続きは、Twitch で。</h1><p>{unboxingConfig.invite}</p>
            <ul>{live.deliveries.map(item => <li key={item.id}><span>{item.icon} {item.username}</span><small>ギフト ＋ 💌</small></li>)}</ul>
            <button className="twitch-primary" onClick={live.openTwitch} autoFocus disabled={phase === "JOINING_TWITCH"}>{phase === "JOINING_TWITCH" ? handoffConfig.joiningMessage : "Twitch で開封配信を見る →"}</button>
            <small>届いたプレゼントも、一緒にお引っ越し。</small>
          </section>
        )}
        {goalVisible && (
          <section
            className={`gift-goal ${phase !== "GIFT_EVENT" ? "completed" : ""}`}
            aria-label="SPECIAL GIFT EVENT"
            aria-live="polite"
          >
            <small>
              {phase !== "GIFT_EVENT" ? "GOAL COMPLETED" : "✦ SPECIAL EVENT ✦"}
            </small>
            <p>
              ギフトを{GIFT_GOAL}個送って
              <br />
              <strong>Birthday Event</strong> を解放！
            </p>
            <div className="goal-lights">
              {Array.from({ length: GIFT_GOAL }, (_, i) => (
                <i key={i} className={i < giftCount ? "lit" : ""} />
              ))}
            </div>
            <span>
              {giftCount} / {GIFT_GOAL}
            </span>
          </section>
        )}
        <div className="on-air">
          <span /> ON AIR <i>just us, hanging out.</i>
        </div>
        <div
          className="chat"
          role="log"
          aria-label="ライブコメント"
          aria-live="polite"
        >
          {chat.map((m) => (
            <div
              className={`chat-line ${m.type === "chat" ? "comment" : m.type} ${m.username?.toLowerCase() === evolEvent.username.toLowerCase() ? "featured-comment" : ""}`}
              key={m.id}
            >
              {m.type === "chat" && (
                <span className="chat-avatar">{m.username[0]}</span>
              )}
              <div>
                {m.username && <b>{m.username}</b>} <span>{m.message}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="activity" role="status">
          {activity?.message}
        </div>
        {spotlight && (
          <div
            key={spotlight.id}
            className="evol-spotlight"
            role="status"
            style={{ "--spotlight-duration": `${evolEvent.highlightMs}ms` }}
          >
            <strong>✦ {spotlight.username}</strong>
            <span>{spotlight.message}</span>
          </div>
        )}
        <div className="hearts" aria-hidden="true">
          {hearts.map((h) => (
            <span
              key={h.id}
              style={{
                "--x": `${h.x}px`,
                "--size": `${h.size}px`,
                "--drift": `${h.drift}px`,
                "--curve": `${h.curve}px`,
                "--rotation": `${h.rotation}deg`,
                "--opacity": h.opacity,
                animationDuration: `${h.duration}ms`,
                animationDelay: `${h.delay}ms`,
              }}
              onAnimationEnd={() => live.removeHeart(h.id)}
            >
              {h.symbol}
            </span>
          ))}
        </div>
        {giftEffect && (
          <div key={giftEffect.id} className="gift-effect" aria-hidden="true">
            {giftEffect.icon}
            <small>{giftEffect.name} ×1</small>
          </div>
        )}
        <div className="side-controls">
          <button
            className={`gift-button ${phase === "GIFT_EVENT" ? "pulse" : ""}`}
            aria-label="ギフト"
            disabled={blocked}
            onClick={() => setPanel(true)}
          >
            🎁
          </button>
          <small>ギフト</small>
          <button
            className={`heart-button ${phase === "LIKE_HINT" ? "pulse" : ""}`}
            aria-label="いいね"
            disabled={blocked}
            onClick={live.like}
          >
            ♥
          </button>
          <small aria-label="いいね数">
            {Math.min(likes, LIKE_GOAL)} / {LIKE_GOAL}
          </small>
        </div>
        <form
          className="bottom-controls"
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) {
              live.addChat([
                { username: "you", message: message.trim(), type: "chat" },
              ]);
              setMessage("");
            }
          }}
        >
          <div className="comment-composer">
          <input
            aria-label="コメント"
            placeholder="コメントする…"
            maxLength={120}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {!live.openingChoice && likes === 0 && ["NORMAL", "LIKE_HINT"].includes(phase) && (
            <div className="opening-choices" role="group" aria-label="開場聊天選項">
              {openingChat.choices.map(choice => <button type="button" key={choice.id} onClick={() => live.chooseOpening(choice.id)}>{choice.label}</button>)}
            </div>
          )}
          </div>
          <button aria-label="コメントを送信" disabled={!message.trim()}>
            ↑
          </button>
          <span aria-hidden="true">☺</span>
        </form>
        {panel && (
          <div
            className="panel-backdrop"
            onClick={() => setPanel(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setPanel(false);
            }}
          >
            <section
              className="gift-panel"
              role="dialog"
              aria-modal="true"
              aria-label="ギフトを選ぶ"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close"
                aria-label="閉じる"
                autoFocus
                onClick={() => setPanel(false)}
              >
                ×
              </button>
              <small>SEND A LITTLE LOVE</small>
              <h2>気持ちを、ギフトに。</h2>
              <div className="gift-grid">
                {gifts.map((g) => (
                  <button
                    key={g.name}
                    aria-label={`${g.name}を送る`}
                    onClick={() => {
                      live.sendGift(g);
                      setPanel(false);
                    }}
                  >
                    <span>{g.icon}</span>
                    {g.name}
                  </button>
                ))}
              </div>
              <p>
                {phase === "GIFT_EVENT"
                  ? `ギフトを送って Birthday Event を解放！ ${giftCount} / ${GIFT_GOAL}`
                  : "ハートで何かが起こるかも…"}
              </p>
              <small>無料のシミュレーションです</small>
            </section>
          </div>
        )}
        {phase === "BIRTHDAY_COUNTDOWN" && (
          <div className="event-overlay" aria-live="assertive">
            <small>SPECIAL EVENT</small>
            <h2>UNLOCKED</h2>
            <span key={countdown}>{countdown ?? "✦"}</span>
          </div>
        )}
        {phase === "BIRTHDAY" && (
          <>
            <BirthdayDecorations/>
            <div className="birthday-banner">🎉 HAPPY BIRTHDAY! 🎉</div>
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 42 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    left: `${(i * 37) % 100}%`,
                    background: ["#ff85b5", "#b6a0ff", "#ffdf9b"][i % 3],
                    animationDelay: `${(i % 7) * 0.25}s`,
                    animationDuration: `${3 + (i % 4) * 0.4}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

      </section>
      <footer className="page-footer">
        <span className="footer-dot" /> A little moment. A little magic.
      </footer>
    </main>
  );
}
