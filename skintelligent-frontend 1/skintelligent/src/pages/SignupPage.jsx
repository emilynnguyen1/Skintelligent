import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useAuthConfigQuery, useSignupMutation } from "../api/hooks";
import { PageTransition, Reveal } from "../components/Motion";
import TurnstileChallenge, { getTurnstileSiteKey, isTurnstileEnabled } from "../components/TurnstileChallenge";
import { useNotificationEffect } from "../hooks/useNotificationEffect";
import { formatApiError } from "../lib/formatters";
import { colors } from "../styles/tokens";
import * as s from "../styles/shared";

export default function SignupPage() {
  const navigate = useNavigate();
  const formStartedAtRef = useRef(new Date().toISOString());
  const turnstileRef = useRef(null);
  const authConfigQuery = useAuthConfigQuery();
  const configuredSiteKey = authConfigQuery.data?.turnstile_site_key || "";
  const turnstileSiteKey = getTurnstileSiteKey(configuredSiteKey || undefined);
  const turnstileRequired = authConfigQuery.isSuccess && Boolean(authConfigQuery.data?.turnstile_required);
  const turnstileEnabled = Boolean(turnstileSiteKey) || isTurnstileEnabled();
  const signupMutation = useSignupMutation();
  const signupError = formatApiError(signupMutation.error);
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      website: "",
    },
  });

  useNotificationEffect(
    signupError,
    (api, message) => api.error(message, { title: "Sign-up failed" }),
    [signupMutation.error],
  );

  useEffect(() => {
    if (!signupMutation.error || !turnstileEnabled) {
      return;
    }
    turnstileRef.current?.reset();
    setTurnstileResetNonce((current) => current + 1);
  }, [signupMutation.error, turnstileEnabled]);

  const onSubmit = async (values) => {
    try {
      const payload = await signupMutation.mutateAsync({
        ...values,
        captcha_token: captchaToken || undefined,
        form_started_at: formStartedAtRef.current,
      });
      navigate(payload.user.profile ? "/dashboard" : "/onboarding", { replace: true });
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
          Create your account to get started
        </Reveal>

        <Reveal
          delay={160}
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.5rem" }}
        >
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            {...register("website")}
          />
          <input
            placeholder="Full name"
            className="motion-input motion-liquid-focus"
            style={s.input}
            {...register("name", { required: true, minLength: 2 })}
          />
          <input
            type="email"
            placeholder="Email address"
            className="motion-input motion-liquid-focus"
            style={s.input}
            {...register("email", { required: true })}
          />
          <input
            type="password"
            placeholder="Create password"
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
            signupMutation.isPending ||
            formState.isSubmitting ||
            (turnstileEnabled && !captchaToken) ||
            (turnstileRequired && !turnstileSiteKey)
          }
          style={{ ...s.btnPrimary, width: "100%", padding: "0.9rem" }}
        >
          {signupMutation.isPending ? "Creating account..." : "Create Account"}
        </button>
        <Reveal as="p" delay={220} style={{ fontSize: "0.82rem", color: colors.lightMid, marginTop: "1.5rem" }}>
          Already have an account?{" "}
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
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </Reveal>
      </form>
    </PageTransition>
  );
}
