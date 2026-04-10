import { chip as chipStyle } from "../styles/shared";

function normalizeItem(item) {
  if (typeof item === "string") {
    return { label: item, value: item };
  }
  return item;
}

export default function ChipSelect({ items, selected, onChange, multi = true }) {
  const selectedValues = multi ? selected || [] : selected;

  const toggle = (value) => {
    if (multi) {
      onChange(
        selectedValues.includes(value)
          ? selectedValues.filter((entry) => entry !== value)
          : [...selectedValues, value],
      );
      return;
    }
    onChange(value);
  };

  const isActive = (value) => (multi ? selectedValues.includes(value) : selectedValues === value);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "1rem" }}>
      {items.map((rawItem, index) => {
        const item = normalizeItem(rawItem);
        return (
          <button
            className="motion-chip motion-chip-button"
            key={item.value}
            type="button"
            onClick={() => toggle(item.value)}
            style={{ ...chipStyle(isActive(item.value)), "--stagger-index": index }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
