"use client";

const STARS = [
  { top: "7%", left: "14%", size: 2 },
  { top: "12%", left: "72%", size: 1.5 },
  { top: "18%", left: "38%", size: 2 },
  { top: "28%", left: "88%", size: 1.5 },
  { top: "42%", left: "8%", size: 2 },
  { top: "55%", left: "64%", size: 1.5 },
  { top: "68%", left: "22%", size: 2 },
  { top: "76%", left: "81%", size: 1.5 },
  { top: "84%", left: "46%", size: 2 },
];

export function SpaceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="space-gradient" />
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      {STARS.map((star, index) => (
        <span
          key={index}
          className="star"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
        />
      ))}
    </div>
  );
}
