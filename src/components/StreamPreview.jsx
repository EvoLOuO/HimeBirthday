import { useEffect, useState } from "react";
import { characterImages, characterStyle, characterMotion as motion } from "../data/characterImages.js";
import useAvatarMotion from './useAvatarMotion.js';
import { birthdayConfig } from "../data/birthday.js";
export default function StreamPreview({
  bubble,
  reaction,
  expression = "default",
}) {
  const motionRef = useAvatarMotion();
  const [failed, setFailed] = useState([]);
  const [available, setAvailable] = useState([]);
  const optionalSource = expression === "default" ? null : characterImages[expression];
  useEffect(() => {
    if (!optionalSource || available.includes(optionalSource) || failed.includes(optionalSource)) return;
    const probe = new Image();
    probe.onload = () => setAvailable(old => [...old, optionalSource]);
    probe.onerror = () => setFailed(old => [...old, optionalSource]);
    probe.src = optionalSource;
    return () => { probe.onload = null; probe.onerror = null; };
  }, [optionalSource, available, failed]);
  const source = [available.includes(optionalSource) ? optionalSource : null, characterImages.default]
    .find(path => path && !failed.includes(path));
  return (
    <div className="stream-preview">
      <div className="room-window">
        <span>✦</span>
        <span>☾</span>
        <span>✧</span>
      </div>
      <div className="room-label">
        {birthdayConfig.streamerName}’s room <span>✧</span>
      </div>
      <div ref={motionRef} className={`avatar-idle avatar-motion ${motion.enabled ? 'motion-enabled' : ''}`} style={{...characterStyle, '--sway-angle': `${motion.swayDeg}deg`, '--float-y': `${-motion.floatPx}px`, '--breath-scale': motion.breathScale, '--breath-duration': `${motion.breathMs}ms`, '--sway-duration': `${motion.swayMs}ms`}}>
        <div className="avatar-track"><div className="avatar-breath">
        <div key={reaction} className={`avatar emotion-${expression} ${reaction ? "reacting" : ""}`}>
          {source ? (
            <img
              key={source}
              src={source}
              alt="配信者のアバター"
              onError={() => setFailed((old) => [...old, source])}
            />
          ) : (
            <div
              className="placeholder"
              role="img"
              aria-label="ピンクの髪と猫耳のバーチャル配信者"
            >
              <div className="hair-back" />
              <div className="ear left" />
              <div className="ear right" />
              <div className="body" />
              <div className="neck" />
              <div className="face">
                <i className="eye left" />
                <i className="eye right" />
                <i className="blush left" />
                <i className="blush right" />
                <i className="mouth" />
              </div>
              <div className="bang one" />
              <div className="bang two" />
              <div className="hair-pin">✦</div>
              <div className="bow">୨୧</div>
            </div>
          )}
        </div>
        </div></div>
      </div>
      <div className="speech-anchor" aria-live="polite" aria-atomic="true">
        {bubble && (
          <div
            key={bubble.id}
            className="speech"
            style={{ "--bubble-duration": `${bubble.duration}ms` }}
          >
            {bubble.text}
          </div>
        )}
      </div>
      <div className="desk" />
      <div className="mic">♩</div>
    </div>
  );
}
