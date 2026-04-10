import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { StaggerGroup, Reveal } from "./Motion";
import LoadingBlock from "./LoadingBlock";
import { colors } from "../styles/tokens";
import * as s from "../styles/shared";

const EXIT_DURATION_MS = 520;

export default function LoadingScreen({
  active,
  eyebrow = "Loading",
  title = "Give Us a Moment",
  message = "We’re preparing your experience.",
  chips = [],
}) {
  const [phase, setPhase] = useState(active ? "entered" : "hidden");

  useEffect(() => {
    if (active) {
      setPhase("entered");
      return undefined;
    }

    if (phase === "hidden") {
      return undefined;
    }

    setPhase("exiting");
    const timeoutId = window.setTimeout(() => {
      setPhase("hidden");
    }, EXIT_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [active, phase]);

  if (phase === "hidden") {
    return null;
  }

  const overlay = (
    <div
      className={`loading-screen ${phase === "exiting" ? "is-exiting" : "is-entered"}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-screen__backdrop" />
      <div className="loading-screen__panel">
        <Reveal as="p" delay={40} style={{ ...s.sectionLabel, textAlign: "center", marginBottom: "0.85rem" }}>
          {eyebrow}
        </Reveal>
        <Reveal
          as="h1"
          delay={100}
          style={{
            ...s.sectionTitle,
            textAlign: "center",
            fontSize: "clamp(2rem, 4vw, 3.15rem)",
            maxWidth: "16ch",
            margin: "0 auto 1rem",
          }}
        >
          {title}
        </Reveal>
        <Reveal
          as="p"
          delay={160}
          style={{
            ...s.sectionSub,
            textAlign: "center",
            margin: "0 auto 1.85rem",
            maxWidth: "50ch",
          }}
        >
          {message}
        </Reveal>

        <Reveal delay={220} className="loading-screen__status">
          <LoadingBlock title="Working on it" message="This should only take a moment." />
        </Reveal>

        {chips.length ? (
          <StaggerGroup
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.65rem",
              flexWrap: "wrap",
              marginTop: "1.4rem",
            }}
          >
            {chips.map((chip, index) => (
              <Reveal
                key={chip}
                as="span"
                index={index}
                variant="pop"
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.62)",
                  border: `1px solid ${colors.border}`,
                  color: colors.moss,
                  fontSize: "0.78rem",
                }}
              >
                {chip}
              </Reveal>
            ))}
          </StaggerGroup>
        ) : null}
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return overlay;
  }

  return createPortal(overlay, document.body);
}
