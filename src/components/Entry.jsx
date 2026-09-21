import { birthdayConfig as config } from "../data/birthday.js";
import StreamPreview from "./StreamPreview.jsx";
import { tiktokConfig } from "../data/config.js";
export function TikTokIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M29 7h6c0 6 3 9 9 10v6a20 20 0 0 1-9-3v14a12 12 0 1 1-12-12v7a5 5 0 1 0 6 5Z"
        fill="#25f4ee"
        transform="translate(-2 1)"
      />
      <path
        d="M29 7h6c0 6 3 9 9 10v6a20 20 0 0 1-9-3v14a12 12 0 1 1-12-12v7a5 5 0 1 0 6 5Z"
        fill="#fe2c55"
        transform="translate(2 -1)"
      />
      <path
        d="M29 7h6c0 6 3 9 9 10v6a20 20 0 0 1-9-3v14a12 12 0 1 1-12-12v7a5 5 0 1 0 6 5Z"
        fill="white"
      />
    </svg>
  );
}
export default function Entry({ screen, onOpen, onEnter, onBack }) {
  return (
    <main className="page">
      <section className="live entry">
        {screen === "HOME" ? (
          <div className="launch-screen">
            <button
              className="app-icon"
              aria-label="TikTokを開く"
              onClick={onOpen}
            >
              <TikTokIcon />
            </button>
            <h1>TikTok</h1>
            <p>タップして、会いにいこう。</p>
          </div>
        ) : (
          <>
            <header className="discovery-header">
              <button aria-label="戻る" onClick={onBack}>
                ‹
              </button>
              <TikTokIcon />
              <strong>LIVE</strong>
            </header>
            <div className="discovery-heading">
              <small>FOR YOU</small>
              <h1>いま、配信中。</h1>
              <p>いつもの場所で、待ってるよ。</p>
            </div>
            <button
              className="room-card"
              aria-label={`${config.streamerName}のライブに入る`}
              onClick={onEnter}
            >
              <div className="room-thumbnail">
                <StreamPreview reaction={0} />
                <span className="live-badge">LIVE</span>
              </div>
              <div className="room-card-info">
                <strong>{config.streamerName}</strong>
                <small>@{config.username} · {tiktokConfig.viewers.toLocaleString("en-US")} 人が視聴中</small>
                <p>まったりお話ししよ〜</p>
                <span className="room-enter">ライブに参加 →</span>
              </div>
            </button>
          </>
        )}
      </section>
    </main>
  );
}
