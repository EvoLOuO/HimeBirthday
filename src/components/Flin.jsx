import { useState } from "react";
import { flinConfig as config } from "../data/config.js";

export default function Flin({ state, response, onTap }) {
  const [failedImage, setFailedImage] = useState(null);
  if (state === "HIDDEN") return null;
  const activating = [
    "ENTERING",
    "LOOKING",
    "PRESSING_BUTTON",
    "PRESSED",
  ].includes(state);
  const pressed = state === "PRESSED";
  const style = {
    "--flin-image-position": config.imagePosition,
    "--flin-approach": `${config.timing.approachMs}ms`,
    "--flin-press": `${config.timing.pressMs}ms`,
    "--flin-leave": `${config.timing.leaveMs}ms`,
    "--flin-tap": `${config.timing.tapMs}ms`,
    "--flin-feature-size": config.activation.photoSize,
    "--flin-button-width": config.activation.buttonWidth,
  };
  for (const [key, value] of Object.entries(config.position))
    style[`--flin-${key}`] = value;
  for (const [key, value] of Object.entries(config.mobilePosition))
    style[`--flin-mobile-${key}`] = value;
  return (
    <div
      className={`flin-stage flin-${state.toLowerCase()} ${activating ? "flin-activating" : ""}`}
      style={style}
      data-state={state}
    >
      {activating && (
        <div className="flin-scene-caption">
          <small>SPECIAL GUEST</small>
          <strong>{config.name}にまかせて！🐾</strong>
        </div>
      )}
      {activating && (
        <div
          className={`flin-event-switch ${pressed ? "is-pressed" : ""}`}
          role="img"
          aria-label={
            pressed
              ? "フリンがSTART EVENTを押しました"
              : "フリンが押すSTART EVENTボタン"
          }
        >
          <small>✦ SPECIAL EVENT</small>
          <span>{pressed ? "🐾 CLICK!" : "START EVENT"}</span>
          {pressed && <i className="flin-click-ring" aria-hidden="true" />}
        </div>
      )}
      <div className="flin-character">
        {state === "BIRTHDAY" && (
          <span className="flin-crown" aria-hidden="true">
            👑
          </span>
        )}
        <button
          className="flin-photo"
          aria-label={`${config.name}をなでる`}
          onClick={onTap}
          disabled={state === "LEAVING"}
        >
          {failedImage !== config.image ? (
            <img
              src={config.image}
              alt={config.name}
              onError={() => setFailedImage(config.image)}
            />
          ) : (
            <span
              className="flin-placeholder"
              role="img"
              aria-label="フリンの仮画像"
            >
              🐶
            </span>
          )}
        </button>
        <span className="flin-name">{config.name}</span>
        {["PRESSING_BUTTON", "PRESSED"].includes(state) && (
          <span className="flin-paw" aria-hidden="true">
            <svg viewBox="0 0 100 110" focusable="false">
              <g fill="#fff3d9" stroke="#a66342" strokeWidth="2.5">
                <ellipse cx="17" cy="43" rx="13" ry="19" transform="rotate(-24 17 43)" />
                <ellipse cx="37" cy="25" rx="13" ry="20" transform="rotate(-8 37 25)" />
                <ellipse cx="64" cy="25" rx="13" ry="20" transform="rotate(8 64 25)" />
                <ellipse cx="84" cy="44" rx="12" ry="18" transform="rotate(24 84 44)" />
                <path d="M20 72Q23 48 50 46Q77 48 82 74Q91 101 67 103Q50 97 34 103Q10 100 20 72Z" />
              </g>
              <g fill="#963c59">
                <ellipse cx="17" cy="43" rx="6" ry="10" transform="rotate(-24 17 43)" />
                <ellipse cx="37" cy="25" rx="6" ry="11" />
                <ellipse cx="64" cy="25" rx="6" ry="11" />
                <ellipse cx="84" cy="44" rx="6" ry="10" transform="rotate(24 84 44)" />
                <path d="M31 78Q34 60 50 59Q66 60 70 78Q74 91 62 91Q50 86 39 91Q27 92 31 78Z" />
              </g>
            </svg>
          </span>
        )}
      </div>
      <div className="flin-response" role="status">
        {response ? (
          <span key={response.id}>
            {response.heart && (
              <i className="flin-love" aria-hidden="true">
                🐾❤️
              </i>
            )}
            {response.text}
          </span>
        ) : state === "WATCHING" ? (
          <span>{config.dialogue.watchHint}</span>
        ) : null}
      </div>
    </div>
  );
}
