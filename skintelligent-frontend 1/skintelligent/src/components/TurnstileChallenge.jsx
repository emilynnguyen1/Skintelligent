import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { colors } from "../styles/tokens";

const DEFAULT_TURNSTILE_SITE_KEY = "0x4AAAAAAC39qFxCV174at2A";

export function getTurnstileSiteKey(fallbackSiteKey) {
  if (fallbackSiteKey) {
    return fallbackSiteKey;
  }
  if (import.meta.env.MODE === "test") {
    return import.meta.env.VITE_TURNSTILE_SITE_KEY;
  }
  if (import.meta.env.VITE_TURNSTILE_SITE_KEY) {
    return import.meta.env.VITE_TURNSTILE_SITE_KEY;
  }
  return import.meta.env.PROD ? DEFAULT_TURNSTILE_SITE_KEY : "";
}

export function isTurnstileEnabled() {
  return Boolean(getTurnstileSiteKey());
}

const TurnstileChallenge = forwardRef(function TurnstileChallenge(
  { onTokenChange, siteKey, required = false, resetNonce = 0 },
  ref,
) {
  const turnstileContainerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const turnstileSiteKey = getTurnstileSiteKey(siteKey);
  const [turnstileError, setTurnstileError] = useState("");

  const clearToken = useCallback(() => {
    onTokenChange("");
  }, [onTokenChange]);

  const resetWidget = useCallback(
    (message = "") => {
      clearToken();
      setTurnstileError(message);

      if (!turnstileSiteKey || !window.turnstile) {
        return;
      }

      if (widgetIdRef.current !== null && typeof window.turnstile.reset === "function") {
        try {
          window.turnstile.reset(widgetIdRef.current);
          return;
        } catch {
          widgetIdRef.current = null;
        }
      }

      if (turnstileContainerRef.current) {
        turnstileContainerRef.current.innerHTML = "";
      }
    },
    [clearToken, turnstileSiteKey],
  );

  useImperativeHandle(
    ref,
    () => ({
      reset(message = "") {
        resetWidget(message);
      },
    }),
    [resetWidget],
  );

  useEffect(() => {
    if (!turnstileSiteKey) {
      clearToken();
      widgetIdRef.current = null;
      return undefined;
    }

    let isCancelled = false;
    const scriptId = "cf-turnstile-script";

    const renderWidget = () => {
      if (isCancelled || !turnstileContainerRef.current || !window.turnstile) {
        return;
      }

      turnstileContainerRef.current.innerHTML = "";
      widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: turnstileSiteKey,
        callback(token) {
          onTokenChange(token);
          setTurnstileError("");
        },
        "expired-callback"() {
          resetWidget("Verification expired. We refreshed it for another try.");
        },
        "error-callback"() {
          resetWidget("Verification ran into an issue and was reset. Please try again.");
        },
      });
    };

    if (window.turnstile) {
      renderWidget();
      return () => {
        isCancelled = true;
      };
    }

    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => renderWidget();
    const handleError = () => setTurnstileError("Verification could not be loaded. Please refresh and try again.");

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      isCancelled = true;
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [clearToken, onTokenChange, resetWidget, turnstileSiteKey]);

  useEffect(() => {
    if (!resetNonce) {
      return;
    }
    resetWidget();
  }, [resetNonce, resetWidget]);

  if (!turnstileSiteKey) {
    if (required) {
      return (
        <p style={{ margin: 0, fontSize: "0.78rem", color: colors.terracotta, textAlign: "center" }}>
          Sign-in verification is enabled on the backend, but no Turnstile site key is configured for the frontend.
        </p>
      );
    }
    return null;
  }

  return (
    <div style={{ display: "grid", gap: "0.55rem", justifyItems: "center" }}>
      <div ref={turnstileContainerRef} />
      {turnstileError ? (
        <p style={{ margin: 0, fontSize: "0.78rem", color: colors.terracotta }}>{turnstileError}</p>
      ) : null}
    </div>
  );
});

export default TurnstileChallenge;
