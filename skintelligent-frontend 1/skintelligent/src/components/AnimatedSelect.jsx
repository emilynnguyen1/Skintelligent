import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { colors } from "../styles/tokens";
import * as s from "../styles/shared";

function matchesQuery(option, query) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return `${option.label} ${option.value}`.toLowerCase().includes(normalizedQuery);
}

export default function AnimatedSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Search...",
  searchable = false,
  layout = "stack",
  error = "",
  meta,
  emptyMessage = "No options found.",
}) {
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const panelRef = useRef(null);
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelStyle, setPanelStyle] = useState(null);

  const selectedOption = options.find((option) => option.value === value) ?? null;
  const filteredOptions = useMemo(
    () => options.filter((option) => matchesQuery(option, query)),
    [options, query],
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return undefined;
    }

    const handlePointerDown = (event) => {
      const clickedTrigger = rootRef.current?.contains(event.target);
      const clickedPanel = panelRef.current?.contains(event.target);
      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    if (searchable) {
      window.requestAnimationFrame(() => searchRef.current?.focus());
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, searchable]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || typeof window === "undefined") {
      return undefined;
    }

    const updatePanelPosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const viewportPadding = 12;
      const preferredWidth = Math.max(rect.width, layout === "grid" ? 280 : 240);
      const width = Math.min(preferredWidth, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - width - viewportPadding,
      );
      const estimatedHeight = searchable ? 360 : 280;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const shouldOpenAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight;
      const top = shouldOpenAbove
        ? Math.max(viewportPadding, rect.top - estimatedHeight - 12)
        : rect.bottom + 12;

      setPanelStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 700,
      });
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen, layout, searchable]);

  const handleToggle = () => {
    setIsOpen((current) => !current);
  };

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="animated-select" data-open={isOpen} data-layout={layout}>
      <button
        ref={triggerRef}
        type="button"
        className="animated-select__trigger motion-input motion-liquid-focus"
        style={{
          ...s.input,
          minHeight: "4.55rem",
          display: "grid",
          gap: "0.28rem",
          textAlign: "left",
          paddingRight: "3.25rem",
          borderColor: error ? "rgba(139, 74, 60, 0.34)" : s.input.border,
          boxShadow: error ? "0 0 0 4px rgba(196, 120, 88, 0.08)" : undefined,
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={Boolean(error)}
        onClick={handleToggle}
      >
        <span className="animated-select__label">{label}</span>
        <span
          className={`animated-select__value ${selectedOption ? "is-selected" : ""}`}
          style={{ color: selectedOption ? colors.charcoal : colors.lightMid }}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="animated-select__meta">{meta ?? (selectedOption ? "Tap to change" : "Tap to choose")}</span>
        <span className="animated-select__chevron" aria-hidden="true">
          ⌄
        </span>
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <div
              id={listboxId}
              ref={panelRef}
              role="listbox"
              aria-label={label}
              className="animated-select__panel motion-liquid-surface"
              data-open={isOpen}
              style={panelStyle ?? undefined}
            >
              {searchable ? (
                <div className="animated-select__search-shell">
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    tabIndex={isOpen ? 0 : -1}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="animated-select__search motion-input motion-liquid-focus"
                    style={s.input}
                  />
                </div>
              ) : null}

              <div className={`animated-select__options animated-select__options--${layout}`}>
                {filteredOptions.length ? (
                  filteredOptions.map((option, index) => {
                    const isSelected = option.value === value;
                    return (
                      <button
                        key={String(option.value)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`animated-select__option motion-chip-button ${isSelected ? "is-selected" : ""}`}
                        style={{ "--stagger-index": index }}
                        onClick={() => handleSelect(option.value)}
                      >
                        <span>{option.label}</span>
                        {isSelected ? <span className="animated-select__option-check">Selected</span> : null}
                      </button>
                    );
                  })
                ) : (
                  <div className="animated-select__empty">{emptyMessage}</div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}

      {error ? <p className="animated-select__error">{error}</p> : null}
    </div>
  );
}
