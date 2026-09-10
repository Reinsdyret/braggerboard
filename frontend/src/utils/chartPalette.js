// Validated categorical palette (dataviz skill, references/palette.md): fixed hue order,
// colorblind-safe on adjacent pairs in both light and dark mode. Assign by index, never cycle
// within the first 8 - a participant keeps the same color for as long as they're on the board.
const CATEGORICAL = [
  { light: "#2a78d6", dark: "#3987e5" }, // blue
  { light: "#eb6834", dark: "#d95926" }, // orange
  { light: "#1baf7a", dark: "#199e70" }, // aqua
  { light: "#eda100", dark: "#c98500" }, // yellow
  { light: "#e87ba4", dark: "#d55181" }, // magenta
  { light: "#008300", dark: "#008300" }, // green
  { light: "#4a3aa7", dark: "#9085e9" }, // violet
  { light: "#e34948", dark: "#e66767" }, // red
];

/**
 * Past the validated 8 slots, a generic dashboard would fold extra series into "Other" - but
 * every contestant on a leaderboard is individually meaningful, so instead we keep generating
 * distinguishable hues by rotating around the wheel. These aren't re-validated for CVD safety;
 * the legend and tooltip (name + value, never color alone) carry identity once colors get dense.
 */
function overflowColor(index) {
  const hue = (index * 47) % 360;
  return { light: `hsl(${hue} 65% 45%)`, dark: `hsl(${hue} 70% 65%)` };
}

export function colorForIndex(index, isDark) {
  const entry = CATEGORICAL[index] ?? overflowColor(index);
  return isDark ? entry.dark : entry.light;
}
