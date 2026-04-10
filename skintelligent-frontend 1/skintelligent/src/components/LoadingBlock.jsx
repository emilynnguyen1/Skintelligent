import { colors, fonts } from "../styles/tokens";
import * as s from "../styles/shared";

export default function LoadingBlock({ title = "Loading...", message = "Please wait." }) {
  return (
    <div
      className="motion-card liquid-card"
      style={{ ...s.card, width: "min(100%, 420px)", margin: "0 auto", textAlign: "center" }}
    >
      <div className="loading-orb" aria-hidden="true">
        <div
          className="loading-orb__core"
          style={{
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.92), ${colors.blush} 48%, ${colors.deepRose} 100%)`,
          }}
        />
      </div>
      <div style={{ fontFamily: fonts.display, fontSize: "1.2rem", marginBottom: "0.45rem" }}>
        {title}
      </div>
      <p style={{ margin: 0, color: colors.mid, lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}
