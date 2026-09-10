// Validated categorical palette (dataviz skill, references/palette.md): fixed hue order,
// colorblind-safe on adjacent pairs. Assign by index, never cycle within the first 8 - a
// participant keeps the same color for as long as they're on the board.
const CATEGORICAL = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

/**
 * Past the validated 8 slots, a generic dashboard would fold extra series into "Other" - but
 * every contestant on a leaderboard is individually meaningful, so instead we keep generating
 * distinguishable hues by rotating around the wheel. These aren't re-validated for CVD safety;
 * the legend and tooltip (name + value, never color alone) carry identity once colors get dense.
 */
function overflowColor(index) {
  const hue = (index * 47) % 360;
  return `hsl(${hue} 65% 45%)`;
}

export function colorForIndex(index) {
  return CATEGORICAL[index] ?? overflowColor(index);
}
