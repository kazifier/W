// ---------------------------------------------------------------------------
// Pipe size and schedule table — ASME B36.10 (carbon / alloy) and B36.19
// (stainless, "S" schedules). Wall thicknesses are nominal millimetres.
// Always verify against the project pipe class / material requisition before
// issuing a calculation.
// ---------------------------------------------------------------------------

export interface PipeRow {
  nps: number; // nominal size in inches
  label: string; // e.g. 6"
  od: number; // outside diameter, mm
  sch: Record<string, number>; // schedule -> wall thickness, mm
}

export const PIPE_SIZES: PipeRow[] = [
  { nps: 0.5, label: '1/2"', od: 21.3, sch: { '10S': 2.11, '40': 2.77, STD: 2.77, '80': 3.73, XS: 3.73, '160': 4.78, XXS: 7.47 } },
  { nps: 0.75, label: '3/4"', od: 26.7, sch: { '10S': 2.11, '40': 2.87, STD: 2.87, '80': 3.91, XS: 3.91, '160': 5.56, XXS: 7.82 } },
  { nps: 1, label: '1"', od: 33.4, sch: { '10S': 2.77, '40': 3.38, STD: 3.38, '80': 4.55, XS: 4.55, '160': 6.35, XXS: 9.09 } },
  { nps: 1.25, label: '1-1/4"', od: 42.2, sch: { '10S': 2.77, '40': 3.56, STD: 3.56, '80': 4.85, XS: 4.85, '160': 6.35, XXS: 9.70 } },
  { nps: 1.5, label: '1-1/2"', od: 48.3, sch: { '10S': 2.77, '40': 3.68, STD: 3.68, '80': 5.08, XS: 5.08, '160': 7.14, XXS: 10.15 } },
  { nps: 2, label: '2"', od: 60.3, sch: { '10S': 2.77, '40': 3.91, STD: 3.91, '80': 5.54, XS: 5.54, '160': 8.74, XXS: 11.07 } },
  { nps: 2.5, label: '2-1/2"', od: 73.0, sch: { '10S': 3.05, '40': 5.16, STD: 5.16, '80': 7.01, XS: 7.01, '160': 9.53, XXS: 14.02 } },
  { nps: 3, label: '3"', od: 88.9, sch: { '10S': 3.05, '40': 5.49, STD: 5.49, '80': 7.62, XS: 7.62, '160': 11.13, XXS: 15.24 } },
  { nps: 4, label: '4"', od: 114.3, sch: { '10S': 3.05, '40': 6.02, STD: 6.02, '80': 8.56, XS: 8.56, '120': 11.13, '160': 13.49, XXS: 17.12 } },
  { nps: 5, label: '5"', od: 141.3, sch: { '10S': 3.40, '40': 6.55, STD: 6.55, '80': 9.53, XS: 9.53, '120': 12.70, '160': 15.88, XXS: 19.05 } },
  { nps: 6, label: '6"', od: 168.3, sch: { '10S': 3.40, '40': 7.11, STD: 7.11, '80': 10.97, XS: 10.97, '120': 14.27, '160': 18.26, XXS: 21.95 } },
  { nps: 8, label: '8"', od: 219.1, sch: { '10S': 3.76, '20': 6.35, '30': 7.04, '40': 8.18, STD: 8.18, '60': 10.31, '80': 12.70, XS: 12.70, '100': 15.09, '120': 18.26, '160': 23.01, XXS: 22.23 } },
  { nps: 10, label: '10"', od: 273.0, sch: { '10S': 4.19, '20': 6.35, '30': 7.80, '40': 9.27, STD: 9.27, '60': 12.70, '80': 15.09, XS: 15.09, '100': 18.26, '120': 21.44, '160': 28.58 } },
  { nps: 12, label: '12"', od: 323.8, sch: { '10S': 4.57, '20': 6.35, '30': 8.38, '40': 10.31, STD: 9.53, '60': 14.27, '80': 17.48, XS: 12.70, '100': 21.44, '120': 25.40, '160': 33.32 } },
  { nps: 14, label: '14"', od: 355.6, sch: { '10': 6.35, '20': 7.92, '30': 9.53, '40': 11.13, STD: 9.53, '60': 15.09, '80': 19.05, XS: 12.70, '100': 23.83, '120': 27.79, '160': 35.71 } },
  { nps: 16, label: '16"', od: 406.4, sch: { '10': 6.35, '20': 7.92, '30': 9.53, '40': 12.70, STD: 9.53, '60': 16.66, '80': 21.44, XS: 12.70, '100': 26.19, '120': 30.96, '160': 40.49 } },
  { nps: 18, label: '18"', od: 457.0, sch: { '10': 6.35, '20': 7.92, '30': 11.13, '40': 14.27, STD: 9.53, '60': 19.05, '80': 23.83, XS: 12.70, '100': 29.36, '120': 34.93, '160': 45.24 } },
  { nps: 20, label: '20"', od: 508.0, sch: { '10': 6.35, '20': 9.53, '30': 12.70, '40': 15.09, STD: 9.53, '60': 20.62, '80': 26.19, XS: 12.70, '100': 32.54, '120': 38.10, '160': 50.01 } },
  { nps: 24, label: '24"', od: 610.0, sch: { '10': 6.35, '20': 9.53, '30': 14.27, '40': 17.48, STD: 9.53, '60': 24.61, '80': 30.96, XS: 12.70, '100': 38.89, '120': 46.02, '160': 59.54 } },
  { nps: 26, label: '26"', od: 660.4, sch: { '10': 7.92, '20': 12.70, STD: 9.53, '40': 17.48 } },
  { nps: 30, label: '30"', od: 762.0, sch: { '10': 7.92, '20': 12.70, '30': 15.88, STD: 9.53, '40': 17.48 } },
  { nps: 36, label: '36"', od: 914.4, sch: { '10': 7.92, '20': 12.70, '30': 15.88, STD: 9.53, '40': 19.05 } },
  { nps: 42, label: '42"', od: 1066.8, sch: { '10': 9.53, '20': 12.70, '30': 15.88, STD: 9.53, '40': 22.23 } },
  { nps: 48, label: '48"', od: 1219.2, sch: { '10': 9.53, '20': 12.70, '30': 15.88, STD: 9.53, '40': 26.19 } },
];

export const pipeByNps = (nps: number): PipeRow | undefined => PIPE_SIZES.find((p) => p.nps === nps);

/** Schedules available for a given NPS, ordered small to large. */
export function schedulesFor(nps: number): string[] {
  const row = pipeByNps(nps);
  if (!row) return [];
  const order = ['5S', '10S', '10', '20', '30', '40', 'STD', '60', '80', 'XS', '100', '120', '160', 'XXS'];
  return order.filter((s) => row.sch[s] !== undefined);
}

/** Nominal wall thickness for an NPS + schedule, mm. Falls back to the first available. */
export function wallFor(nps: number, schedule: string): number {
  const row = pipeByNps(nps);
  if (!row) return 0;
  const direct = row.sch[schedule];
  if (direct !== undefined) return direct;
  const first = schedulesFor(nps)[0];
  return first ? row.sch[first] : 0;
}

/** Inside diameter, mm. */
export function idFor(nps: number, schedule: string): number {
  const row = pipeByNps(nps);
  if (!row) return 0;
  return row.od - 2 * wallFor(nps, schedule);
}

export const npsLabel = (nps: number): string => pipeByNps(nps)?.label ?? `${nps}"`;
