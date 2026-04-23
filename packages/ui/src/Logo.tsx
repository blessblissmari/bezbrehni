import * as React from "react";

export interface LogoProps {
  size?: number;
  color?: string;
  noseColor?: string;
  title?: string;
}

/**
 * Логотип «Безбрехни» — лупа с длинным носом.
 */
export function Logo({
  size = 32,
  color = "#1B2330",
  noseColor = "#C77A1F",
  title = "Безбрехни",
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <circle cx="26" cy="26" r="16" stroke={color} strokeWidth="4" />
      <path
        d="M38 38 L54 54"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 26 Q40 22 52 14"
        stroke={noseColor}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="52" cy="14" r="3" fill={noseColor} />
    </svg>
  );
}
