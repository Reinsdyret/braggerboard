import { twMerge } from "tailwind-merge";

export function cx(...inputs) {
  return twMerge(
    inputs
      .flat()
      .filter(Boolean)
      .join(" "),
  );
}
