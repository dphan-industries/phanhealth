export default function Icon({
  name,
  size = 22,
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, string> = {
    Wearables: "M8 2h8l1 5v10l-1 5H8l-1-5V7z M7 8h10 M7 16h10 M10 12h4",
    Wellbeing: "M12 21s-10-6-10-13c0-5 7-7 10-2 3-5 10-3 10 2 0 7-10 13-10 13z",
    "Move the Moon":
      "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M2 12h20 M12 2c-6 6-6 14 0 20 6-6 6-14 0-20",
    Dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    Measurements: "M2 12h4l3-8 5 16 3-8h5",
    "Health history": "M4 4v16h17 M8 14l4-5 4 3 5-7",
    "Offline guides": "M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2v16",
    "Emergency assist": "M12 3 2 21h20L12 3z M12 9v5 M12 17v1",
    heart: "M20 5c-3-3-7 0-8 2-1-2-5-5-8-2-5 5 8 15 8 15S25 10 20 5z",
    arrow: "M5 12h14 M14 7l5 5-5 5",
    shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4z M8 12l3 3 5-6",
    planet:
      "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0 M2 18C-3 13 20 1 23 6c3 5-17 17-21 12",
    pulse: "M3 12h4l3-6 4 12 3-6h4",
    check: "M5 12l4 4L19 6",
    drop: "M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z",
    clock: "M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.planet} />
    </svg>
  );
}
