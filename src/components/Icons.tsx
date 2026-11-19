import type { SVGProps, ReactElement } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const ArrowDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v16m0 0 6-6m-6 6-6-6" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h16m0 0-6-6m6 6-6 6" />
  </svg>
);

export const Eye = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const Compass = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </svg>
);

export const Layers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
  </svg>
);

export const Grid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.2" />
    <rect x="14" y="3" width="7" height="7" rx="1.2" />
    <rect x="3" y="14" width="7" height="7" rx="1.2" />
    <rect x="14" y="14" width="7" height="7" rx="1.2" />
  </svg>
);

export const Cursor = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4 3 7.5 17 2.4-6.6L20.5 11 4 3Z" />
  </svg>
);

export const Spark = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2.5c.6 5.2 2.3 6.9 7.5 7.5-5.2.6-6.9 2.3-7.5 7.5-.6-5.2-2.3-6.9-7.5-7.5 5.2-.6 6.9-2.3 7.5-7.5Z" />
    <path d="M19 16.5c.25 1.8 1 2.5 2.5 2.5-1.5 0-2.25.7-2.5 2.5-.25-1.8-1-2.5-2.5-2.5 1.5 0 2.25-.7 2.5-2.5Z" />
  </svg>
);

export const iconMap: Record<string, (p: IconProps) => ReactElement> = {
  eye: Eye,
  compass: Compass,
  layers: Layers,
  grid: Grid,
  cursor: Cursor,
  spark: Spark,
};
