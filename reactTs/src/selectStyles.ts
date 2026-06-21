import type { StylesConfig } from "react-select";

type Option = { label: string; value: string };

const darkSelectStyles: StylesConfig<Option, true> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "var(--nv-surface-raised)",
    borderColor: state.isFocused ? "var(--nv-accent)" : "var(--nv-border)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(88,166,255,0.15)" : "none",
    "&:hover": { borderColor: "var(--nv-border-hover)" },
    borderRadius: "var(--nv-radius-md)",
    minHeight: "38px",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--nv-surface-raised)",
    border: "1px solid var(--nv-border)",
    borderRadius: "var(--nv-radius-md)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    zIndex: "var(--z-dropdown)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(88,166,255,0.15)"
      : state.isFocused
        ? "rgba(255,255,255,0.05)"
        : "transparent",
    color: state.isSelected ? "var(--nv-accent)" : "var(--nv-text)",
    "&:active": { backgroundColor: "rgba(88,166,255,0.2)" },
    fontSize: "0.875rem",
    fontFamily: "var(--nv-font-display)",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(88,166,255,0.12)",
    borderRadius: "var(--nv-radius-sm)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--nv-accent)",
    fontSize: "0.78rem",
    fontFamily: "var(--nv-font-display)",
    fontWeight: "500",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--nv-accent)",
    borderRadius: "0 var(--nv-radius-sm) var(--nv-radius-sm) 0",
    "&:hover": {
      backgroundColor: "rgba(248,81,73,0.2)",
      color: "var(--nv-danger)",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--nv-text-muted)",
    fontSize: "0.875rem",
    fontFamily: "var(--nv-font-display)",
  }),
  input: (base) => ({
    ...base,
    color: "var(--nv-text)",
    fontFamily: "var(--nv-font-display)",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--nv-text)",
    fontFamily: "var(--nv-font-display)",
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--nv-text-muted)",
    fontSize: "0.875rem",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "var(--nv-border)",
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--nv-text-muted)",
    "&:hover": { color: "var(--nv-danger)" },
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "var(--nv-accent)" : "var(--nv-text-muted)",
    "&:hover": { color: "var(--nv-accent)" },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 8px",
    gap: "4px",
  }),
};

export default darkSelectStyles;
