import { Link } from "react-router-dom";

import { PageTransition, Reveal, StaggerGroup } from "../components/Motion";
import { useAuth } from "../providers/AuthProvider";
import { colors, fonts } from "../styles/tokens";
import * as s from "../styles/shared";

const features = [
  {
    title: "Personalized User Profile",
    desc: "Create your skin identity with type, concerns, and ingredient preferences.",
  },
  {
    title: "Recommendation Engine",
    desc: "Ranked product matching that surfaces the right products for your profile.",
  },
  {
    title: "Product Lookup",
    desc: "Search the catalog and get a personal fit score on every product.",
  },
  {
    title: "Explainable Recommendations",
    desc: "Each recommendation comes with clear reasons, warnings, and score breakdowns.",
  },
  {
    title: "Ingredient Analysis",
    desc: "Inspect ingredient fit, possible conflicts, and sensitivity risks in one place.",
  },
  {
    title: "Saved Products",
    desc: "Build a shortlist and compare the products that are worth revisiting.",
  },
];

const stats = [
  { num: "50K+", label: "Products Analyzed" },
  { num: "1.2M", label: "Reviews Processed" },
  { num: "8K+", label: "Ingredients Indexed" },
  { num: "97%", label: "Recommendation Confidence" },
];

const heroReasons = [
  "Balances oil control with barrier support",
  "Flags fragrance risk before you buy",
  "Ranks products by fit, not hype alone",
];

export default function LandingPage() {
  const { user } = useAuth();
  const primaryHref = user ? (user.profile ? "/dashboard" : "/onboarding") : "/signup";
  const primaryLabel = user ? (user.profile ? "Open Dashboard" : "Complete Your Profile") : "Build your profile";
  const secondaryHref = user ? (user.profile ? "/lookup" : "/onboarding") : "/login";
  const secondaryLabel = user ? (user.profile ? "Explore Products" : "Finish setup") : "Sign in";

  return (
    <PageTransition style={s.page}>
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "9rem 3rem 4rem",
          position: "relative",
        }}
      >
        <div
          className="motion-hero-blob"
          style={{
            position: "absolute",
            right: "-10%",
            top: "5%",
            width: "65vw",
            height: "65vw",
            background:
              "radial-gradient(ellipse, rgba(232,196,178,0.45) 0%, rgba(143,175,136,0.12) 55%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1240,
            width: "100%",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <Reveal as="p" delay={40} style={{ ...s.sectionLabel, marginBottom: "1.2rem" }}>
              AI-Powered Skincare Intelligence
            </Reveal>
            <Reveal
              as="h1"
              delay={100}
              variant="liquid"
              style={{
                fontFamily: fonts.display,
                fontSize: "clamp(3rem, 5.5vw, 5.2rem)",
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                marginBottom: "1.6rem",
              }}
            >
              Skin that <em style={{ fontStyle: "italic", color: colors.deepRose }}>knows</em> what it
              needs
            </Reveal>
            <Reveal
              as="p"
              delay={180}
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: colors.mid,
                maxWidth: "46ch",
                marginBottom: "2.4rem",
              }}
            >
              Skintelligent decodes ingredients, checks the hype, and builds personalized routines
              that match your skin instead of the crowd.
            </Reveal>
            <Reveal
              delay={250}
              variant="bounce"
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}
            >
              <Link to={primaryHref} className="motion-button" style={{ ...s.btnPrimary, textDecoration: "none" }}>
                {primaryLabel}
              </Link>
              <Link to={secondaryHref} className="motion-button" style={{ ...s.btnGhost, textDecoration: "none" }}>
                {secondaryLabel}
              </Link>
            </Reveal>

            <StaggerGroup style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              {["Personalized scoring", "Ingredient warnings", "Explainable fit"].map(
                (label, index) => (
                  <Reveal
                    key={label}
                    as="span"
                    index={index}
                    variant="pop"
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.62)",
                      border: `1px solid ${colors.border}`,
                      color: colors.moss,
                      fontSize: "0.8rem",
                    }}
                  >
                    {label}
                  </Reveal>
                ),
              )}
            </StaggerGroup>
          </div>

          <div style={{ position: "relative", minHeight: 560 }}>
            <Reveal
              delay={120}
              variant="liquid"
              className="motion-card motion-liquid-surface"
              style={{
                ...s.card,
                width: "100%",
                maxWidth: 460,
                marginLeft: "auto",
                padding: "1.4rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ ...s.sectionLabel, marginBottom: "0.35rem" }}>Recommendation Preview</div>
                  <div style={{ fontFamily: fonts.display, fontSize: "1.35rem", color: colors.charcoal }}>
                    Niacinamide Barrier Serum
                  </div>
                </div>
                <div
                  style={{
                    minWidth: 76,
                    height: 76,
                    borderRadius: "22px",
                    background: "linear-gradient(145deg, rgba(232,196,178,0.92), rgba(143,175,136,0.52))",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 18px 40px rgba(139,74,60,0.14)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: fonts.display, fontSize: "1.65rem", color: colors.deepRose, lineHeight: 1 }}>
                      92
                    </div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: colors.mid,
                      }}
                    >
                      Fit score
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                {[
                  ["Skin type match", "90%"],
                  ["Ingredient fit", "95%"],
                  ["Sentiment", "88%"],
                  ["Worth the hype", "91%"],
                ].map(([label, value], index) => (
                  <Reveal
                    key={label}
                    index={index}
                    variant="pop"
                    style={{
                      padding: "0.85rem",
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.64)",
                      border: `1px solid rgba(196,120,88,0.12)`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.68rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: colors.lightMid,
                        marginBottom: "0.3rem",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontFamily: fonts.display, fontSize: "1.1rem", color: colors.deepRose }}>
                      {value}
                    </div>
                  </Reveal>
                ))}
              </div>

              <div
                style={{
                  padding: "1rem 1.05rem",
                  borderRadius: "18px",
                  background: "rgba(74,92,69,0.08)",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontFamily: fonts.display, fontSize: "1rem", color: colors.charcoal, marginBottom: "0.55rem" }}>
                  Why it surfaces first
                </div>
                <StaggerGroup style={{ display: "grid", gap: "0.55rem" }}>
                  {heroReasons.map((reason, index) => (
                    <Reveal
                      key={reason}
                      index={index}
                      variant="reveal"
                      style={{
                        padding: "0.65rem 0.8rem",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.58)",
                        color: colors.moss,
                        fontSize: "0.8rem",
                      }}
                    >
                      + {reason}
                    </Reveal>
                  ))}
                </StaggerGroup>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  {["Oily skin", "Sensitive", "Niacinamide", "Mid budget"].map((label) => (
                    <span
                      key={label}
                      style={{
                        padding: "0.36rem 0.75rem",
                        borderRadius: "999px",
                        background: "rgba(139,74,60,0.08)",
                        color: colors.deepRose,
                        fontSize: "0.76rem",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: colors.lightMid,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Live-style preview
                </div>
              </div>
            </Reveal>

            <Reveal
              delay={260}
              variant="bounce"
              style={{
                ...s.card,
                position: "absolute",
                left: 0,
                bottom: 12,
                width: "min(270px, 72vw)",
                padding: "1.1rem 1rem",
                background: "linear-gradient(180deg, rgba(255,250,246,0.92), rgba(244,236,228,0.82))",
              }}
              className="motion-card"
            >
              <div style={{ ...s.sectionLabel, marginBottom: "0.35rem" }}>What the system checks</div>
              <div style={{ fontFamily: fonts.display, fontSize: "1.05rem", marginBottom: "0.45rem" }}>
                More than just star ratings
              </div>
              <p style={{ margin: 0, color: colors.mid, fontSize: "0.82rem", lineHeight: 1.6 }}>
                Skin concerns, ingredient conflicts, user sentiment, popularity, and price range all
                shape the final recommendation rank.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ background: colors.warmWhite, padding: "6rem 3rem" }}>
        <Reveal delay={40} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={s.sectionLabel}>Platform Features</p>
          <h2 style={{ ...s.sectionTitle, textAlign: "center" }}>
            Everything your skin <em style={s.sectionTitleEm}>deserves to know</em>
          </h2>
        </Reveal>
        <StaggerGroup
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {features.map((feature, index) => (
            <Reveal key={feature.title} index={index} variant="bounce" style={{ ...s.card }} className="motion-card motion-liquid-surface">
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "14px",
                  background: "rgba(196,120,88,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  marginBottom: "1.1rem",
                  color: colors.deepRose,
                }}
              >
                +
              </div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: "1.05rem",
                  color: colors.charcoal,
                  marginBottom: "0.55rem",
                }}
              >
                {feature.title}
              </div>
              <p style={{ fontSize: "0.82rem", color: colors.mid, lineHeight: 1.65 }}>{feature.desc}</p>
            </Reveal>
          ))}
        </StaggerGroup>
      </section>

      <section style={{ textAlign: "center", padding: "6rem 3rem" }}>
        <Reveal delay={40}>
          <p style={s.sectionLabel}>By the Numbers</p>
          <h2 style={{ ...s.sectionTitle, textAlign: "center" }}>
            Trusted by skin-curious people <em style={s.sectionTitleEm}>everywhere</em>
          </h2>
        </Reveal>
        <StaggerGroup
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "5rem",
            marginTop: "3rem",
            flexWrap: "wrap",
          }}
        >
          {stats.map((stat, index) => (
            <Reveal key={stat.label} index={index} variant="pop" className="motion-stat">
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: "3rem",
                  color: colors.deepRose,
                  lineHeight: 1,
                  marginBottom: "0.4rem",
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: colors.lightMid,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </Reveal>
          ))}
        </StaggerGroup>
      </section>

      <section
        style={{
          background: colors.charcoal,
          textAlign: "center",
          padding: "7rem 3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Reveal
          variant="liquid"
          style={{
            position: "absolute",
            top: "-20%",
            right: "-8%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,196,178,0.18), transparent 68%)",
            pointerEvents: "none",
          }}
          className="motion-hero-blob"
        />
        <Reveal
          as="h2"
          delay={60}
          style={{
            ...s.sectionTitle,
            color: colors.cream,
            maxWidth: "16ch",
            margin: "0 auto 1.2rem",
            position: "relative",
          }}
        >
          Your skin deserves smarter <em style={{ color: colors.blush, fontStyle: "italic" }}>choices</em>
        </Reveal>
        <Reveal
          as="p"
          delay={140}
          style={{ ...s.sectionSub, color: "rgba(250,246,241,0.55)", margin: "0 auto 2.5rem" }}
        >
          Build your profile in minutes and get ranked recommendations immediately.
        </Reveal>
        <Reveal delay={220} variant="bounce">
          <Link to={primaryHref} className="motion-button" style={{ ...s.btnLight, textDecoration: "none" }}>
            {user ? primaryLabel : "Create your skin profile"}
          </Link>
        </Reveal>
      </section>
    </PageTransition>
  );
}
