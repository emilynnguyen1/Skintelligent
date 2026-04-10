import { colors, fonts } from "../styles/tokens";
import * as s from "../styles/shared";
import FitScoreRing from "./FitScoreRing";
import Tag from "./Tag";

function toPercent(score) {
  return Math.round(score * 100);
}

export default function ProductCard({
  product,
  onOpen,
  onToggleSave,
  isBusy = false,
  transitionState = "idle",
}) {
  const score = product.final_score !== undefined ? toPercent(product.final_score) : null;
  const primaryReason = product.reason_codes?.[0] || "Saved to revisit later.";
  const isExiting = transitionState !== "idle";

  return (
    <div
      className={`motion-liquid-surface product-card-shell ${
        isExiting ? `product-card-shell--${transitionState}` : ""
      }`.trim()}
      role="button"
      tabIndex={0}
      onClick={isExiting ? undefined : onOpen}
      onKeyDown={(event) => {
        if (isExiting) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      style={{
        ...s.card,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        cursor: isExiting ? "default" : "pointer",
        minHeight: 430,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: isExiting ? 0.96 : 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${colors.terracotta}, ${colors.blush})`,
        }}
      />

      <button
        className={`motion-save-toggle motion-press ${
          product.saved ? "is-saved" : ""
        } ${isBusy ? "is-saving" : ""}`.trim()}
        type="button"
        aria-label={product.saved ? "Remove saved product" : "Save product"}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSave();
        }}
        disabled={isBusy || isExiting}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          fontSize: "1.1rem",
          opacity: 0.78,
          cursor: isExiting ? "default" : "pointer",
          background: "none",
          border: "none",
          color: product.saved ? colors.deepRose : colors.lightMid,
        }}
      >
        {product.saved ? "\u2665" : "\u2661"}
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          marginBottom: "1rem",
          minHeight: 82,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.72rem",
              color: colors.lightMid,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.25rem",
            }}
          >
            {product.brand}
          </div>
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: "1.1rem",
              color: colors.charcoal,
              paddingRight: "2rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.9rem",
              lineHeight: 1.3,
            }}
          >
            {product.product_name}
          </div>
        </div>
        {score !== null ? <FitScoreRing score={score} /> : null}
      </div>

      <p
        style={{
          fontSize: "0.82rem",
          color: colors.mid,
          lineHeight: 1.65,
          marginBottom: "1rem",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "4.1rem",
        }}
      >
        {product.description}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem", minHeight: 34 }}>
        {product.ingredients?.slice(0, 3).map((ingredient, index) => (
          <Tag key={ingredient} variant="moss" motionIndex={index}>
            {ingredient}
          </Tag>
        ))}
        <Tag variant="terra" motionIndex={3}>
          ${Math.round(product.price)}
        </Tag>
      </div>

      <div
        style={{
          padding: "0.65rem 0.9rem",
          borderRadius: "12px",
          background: "rgba(74,92,69,0.07)",
          fontSize: "0.78rem",
          lineHeight: 1.5,
          color: colors.moss,
          marginBottom: "0.8rem",
          minHeight: 72,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        + {primaryReason}
      </div>

      {product.warnings?.length ? (
        <div
          style={{
            padding: "0.65rem 0.9rem",
            borderRadius: "12px",
            background: "rgba(139,74,60,0.08)",
            fontSize: "0.76rem",
            lineHeight: 1.5,
            color: colors.deepRose,
            minHeight: 56,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.warnings[0]}
        </div>
      ) : (
        <div style={{ minHeight: 56 }} />
      )}
    </div>
  );
}
