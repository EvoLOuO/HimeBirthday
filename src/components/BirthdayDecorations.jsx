// Decorative foreground only; automatically unmounts when the celebration ends.
export default function BirthdayDecorations() {
  return (
    <div className="birthday-decorations" aria-hidden="true">
      <div className="birthday-bunting">✦ · HAPPY BIRTHDAY · ✦</div>
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className="party-balloon"
          style={{
            "--balloon-x": `${i < 4 ? 3 + i * 6 : 75 + (i - 4) * 6}%`,
            "--balloon-delay": `${(i % 4) * 0.6}s`,
            "--balloon-color": ["#f9a8ce", "#d6b4ff", "#ffe1a4", "#abdedf"][
              i % 4
            ],
          }}
        >
          <i />
        </span>
      ))}
      <span className="party-cake cake-left">🎂</span>
      <span className="party-cake cake-right">🧁</span>
      <div className="birthday-cake-tray">
        <span>🧁</span>
        <span>🎂</span>
        <span>🧁</span>
      </div>
      <span className="party-sparkle sparkle-left">✨</span>
      <span className="party-sparkle sparkle-right">✨</span>
    </div>
  );
}
