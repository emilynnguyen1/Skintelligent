import { useEffect, useRef, useState } from "react";

const HOLD_OFFSET = 18;
const DISMISS_OFFSET = -96;
const DISMISS_THRESHOLD = -44;
const INTERACTIVE_SELECTOR = "[data-toast-interactive='true']";

export default function Toast({
  toast,
  onDismiss,
  onPause,
  onResume,
}) {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const pointerIdRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      setOffsetY(0);
    }
  }, [isDragging]);

  const handlePointerDown = (event) => {
    if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    startYRef.current = event.clientY;
    setIsDragging(true);
    onPause(toast.id);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaY = event.clientY - startYRef.current;
    if (deltaY >= 0) {
      setOffsetY(Math.min(deltaY, HOLD_OFFSET));
      return;
    }

    setOffsetY(Math.max(deltaY, DISMISS_OFFSET));
  };

  const finishGesture = (shouldDismiss) => {
    setIsDragging(false);
    pointerIdRef.current = null;

    if (shouldDismiss) {
      onDismiss(toast.id);
      return;
    }

    onResume(toast.id);
  };

  const handlePointerUp = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    finishGesture(offsetY <= DISMISS_THRESHOLD);
  };

  const handlePointerCancel = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    finishGesture(false);
  };

  return (
    <div
      role="status"
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      className={`toast-card toast-card--${toast.variant} ${toast.isDismissing ? "is-dismissing" : ""}`.trim()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => {
        if (!isDragging) {
          onResume(toast.id);
        }
      }}
      onFocus={() => onPause(toast.id)}
      onBlur={() => {
        if (!isDragging) {
          onResume(toast.id);
        }
      }}
      style={{
        transform: `translateY(${offsetY}px) scale(${isDragging ? 1.01 : 1})`,
        transition: isDragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease",
      }}
    >
      <div className="toast-card__accent" />
      <div className="toast-card__body">
        {toast.title ? <div className="toast-card__title">{toast.title}</div> : null}
        <div className="toast-card__message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-card__close"
        aria-label="Dismiss notification"
        data-toast-interactive="true"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
        }}
        onPointerCancel={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onDismiss(toast.id);
        }}
      >
        x
      </button>
    </div>
  );
}
