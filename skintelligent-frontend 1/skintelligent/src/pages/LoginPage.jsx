import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthConfigQuery, useLoginMutation } from "../api/hooks";
import { PageTransition, Reveal } from "../components/Motion";
import TurnstileChallenge, { getTurnstileSiteKey, isTurnstileEnabled } from "../components/TurnstileChallenge";
import { useNotificationEffect } from "../hooks/useNotificationEffect";
import { formatApiError } from "../lib/formatters";
import { colors } from "../styles/tokens";
import * as s from "../styles/shared";

function getLoginError(error, { turnstileRequired, hasTurnstileSiteKey }) {
  if (!error) {
    return "";
  }
  if (error.status === 401) {
    return "Invalid email or password.";
  }
  if (error.status === 429) {
    return "Too many sign-in attempts. Try again later.";
  }
  if (error.status === 400 && error.message === "Sign-in verification is required." && !hasTurnstileSiteKey) {
    return turnstileRequired
      ? "Login is blocked because the backend requires Turnstile, but the frontend has no site key configured."
      : error.message;
  }
  return formatApiError(error);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const turnstileRef = useRef(null);
  const authConfigQuery = useAuthConfigQuery();
  const configuredSiteKey = authConfigQuery.data?.turnstile_site_key || "";
  const turnstileSiteKey = getTurnstileSiteKey(configuredSiteKey || undefined);
  const turnstileRequired = authConfigQuery.isSuccess && Boolean(authConfigQuery.data?.turnstile_required);
  const turnstileEnabled = Boolean(turnstileSiteKey) || isTurnstileEnabled();
  const loginMutation = useLoginMutation();
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const loginError = getLoginError(loginMutation.error, {
    turnstileRequired,
    hasTurnstileSiteKey: Boolean(turnstileSiteKey) || isTurnstileEnabled(),
  });
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useNotificationEffect(
    loginError,
    (api, message) => api.error(message, { title: "Sign-in failed" }),
    [loginMutation.error],
  );

  useEffect(() => {
    if (!loginMutation.error || !turnstileEnabled) {
      return;
    }
    turnstileRef.current?.reset();
    setTurnstileResetNonce((current) => current + 1);
  }, [loginMutation.error, turnstileEnabled]);

  const onSubmit = async (values) => {
    try {
      const payload = await loginMutation.mutateAsync({
        ...values,
        captcha_token: captchaToken || undefined,
      });
      const nextRoute = payload.user.profile ? location.state?.from || "/dashboard" : "/onboarding";
      navigate(nextRoute, { replace: true });
    } catch {
      if (turnstileEnabled) {
        turnstileRef.current?.reset("Verification refreshed after the failed attempt.");
        setTurnstileResetNonce((current) => current + 1);
      }
    }
  };

  return (
    <PageTransition
      style={{
        ...s.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="motion-card motion-liquid-surface"
        style={{ ...s.card, width: "100%", maxWidth: 420, textAlign: "center" }}
      >
        <Reveal as="div" delay={40} style={{ ...s.logo, marginBottom: "0.5rem" }}>
          Skin<span style={s.logoAccent}>telligent</span>
        </Reveal>
        <Reveal as="p" delay={100} style={{ fontSize: "0.85rem", color: colors.mid, marginBottom: "2rem" }}>
          Sign in to your skin profile
        </Reveal>

        <Reveal
          delay={160}
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.5rem" }}
        >
          <input
            type="email"
            placeholder="Email address"
            className="motion-input motion-liquid-focus"
            style={s.input}
            {...register("email", { required: true })}
          />
          <input
            type="password"
            placeholder="Password"
            className="motion-input motion-liquid-focus"
            style={s.input}
            {...register("password", { required: true, minLength: 8 })}
          />
          <TurnstileChallenge
            ref={turnstileRef}
            onTokenChange={setCaptchaToken}
            siteKey={turnstileSiteKey || undefined}
            required={turnstileRequired}
            resetNonce={turnstileResetNonce}
          />
          {turnstileEnabled ? (
            <button
              type="button"
              className="motion-link"
              style={{
                alignSelf: "center",
                background: "none",
                border: "none",
                color: colors.deepRose,
                cursor: "pointer",
                fontSize: "0.8rem",
                padding: 0,
                textDecoration: "underline",
              }}
              onClick={() => {
                turnstileRef.current?.reset("Verification reset. Please try again.");
                setTurnstileResetNonce((current) => current + 1);
              }}
            >
              Reset verification
            </button>
          ) : null}
        </Reveal>

        <button
          type="submit"
          className="motion-button"
          disabled={
            loginMutation.isPending ||
            formState.isSubmitting ||
            (turnstileEnabled && !captchaToken) ||
            (turnstileRequired && !turnstileSiteKey)
          }
          style={{ ...s.btnPrimary, width: "100%", padding: "0.9rem" }}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </button>
        <Reveal as="p" delay={220} style={{ fontSize: "0.82rem", color: colors.lightMid, marginTop: "1.5rem" }}>
          New here?{" "}
          <button
            type="button"
            className="motion-link"
            style={{
              background: "none",
              border: "none",
              color: colors.deepRose,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
            onClick={() => navigate("/signup")}
          >
            Create an account
          </button>
        </Reveal>
      </form>
    </PageTransition>
  );
}
