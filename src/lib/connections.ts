import type { JointKind, MaterialGroup } from './data';

// ---------------------------------------------------------------------------
// Component types and the connection (joint location) library
// ---------------------------------------------------------------------------

export type ComponentType = 'pipe' | 'plate' | 'tube';

export interface ConnectionDef {
  id: string;
  component: ComponentType;
  label: string;
  detail: string;
  jointKind: JointKind;
  lengthBasis: 'circ' | 'fixed';
  /** Which dimension the weld length is taken around. */
  sizeSource: 'nps' | 'shellOd' | 'panel' | 'tubeOd';
  ndt: Record<string, number>;
}

export const CONNECTIONS: ConnectionDef[] = [
  // ---------------- pipe ----------------
  {
    id: 'pipe_pipe', component: 'pipe', label: 'Pipe to pipe (butt weld)',
    detail: 'Girth weld between two pipe lengths or spools. Length = pi x OD.',
    jointKind: 'singleV', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'pipe_fitting', component: 'pipe', label: 'Pipe to fitting (elbow / tee / reducer)',
    detail: 'Butt weld to a wrought or forged fitting. Fitting bore may be slightly different — check alignment.',
    jointKind: 'singleV', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'pipe_flange', component: 'pipe', label: 'Pipe to flange (weld-neck)',
    detail: 'Butt weld onto a weld-neck flange hub. Hub thickness usually exceeds pipe wall.',
    jointKind: 'singleV', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 0, pt: 10, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'pipe_valve', component: 'pipe', label: 'Pipe to valve (butt-weld end)',
    detail: 'Weld to a valve with butt-weld ends. Valve body material may differ from the pipe.',
    jointKind: 'singleV', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'pipe_equip', component: 'pipe', label: 'Pipe to equipment shell (nozzle)',
    detail: 'Nozzle-to-shell connection. Often a full-penetration groove with reinforcing pad or integral reinforcement.',
    jointKind: 'singleV', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 10, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'pipe_dished', component: 'pipe', label: 'Pipe to dished end (nozzle to head)',
    detail: 'Nozzle welded through or onto a 2:1 ellipsoidal / torispherical head. Curved surface — bevel may need profiling.',
    jointKind: 'singleBevel', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 10, pt: 10, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'pipe_sockolet', component: 'pipe', label: 'Pipe to branch (sockolet / weldolet)',
    detail: 'Branch connection. Fillet weld on a sockolet; groove weld on a weldolet.',
    jointKind: 'filletT1', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 0, pt: 10, mt: 10, ut: 0, paut: 0, pmi: 0 },
  },

  // ---------------- plate ----------------
  {
    id: 'plate_long', component: 'plate', label: 'Shell longitudinal seam',
    detail: 'Long seam of a rolled shell course. Length = plate width (or shell length).',
    jointKind: 'doubleV', lengthBasis: 'fixed', sizeSource: 'panel',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 0, ut: 20, paut: 0, pmi: 0 },
  },
  {
    id: 'plate_circ', component: 'plate', label: 'Shell circumferential seam (course to course)',
    detail: 'Girth seam joining two shell courses. Length = pi x shell OD.',
    jointKind: 'doubleV', lengthBasis: 'circ', sizeSource: 'shellOd',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 0, ut: 20, paut: 0, pmi: 0 },
  },
  {
    id: 'plate_shell_dish', component: 'plate', label: 'Shell to dished end',
    detail: 'Closing seam between shell and 2:1 ellipsoidal or torispherical head. Length = pi x shell OD.',
    jointKind: 'singleV', lengthBasis: 'circ', sizeSource: 'shellOd',
    ndt: { vt: 100, rt: 10, pt: 10, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'plate_flat', component: 'plate', label: 'Plate to plate butt (flat panel)',
    detail: 'Flat panel or deck seam, welded from one or both sides.',
    jointKind: 'doubleV', lengthBasis: 'fixed', sizeSource: 'panel',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 0, ut: 20, paut: 0, pmi: 0 },
  },
  {
    id: 'plate_nozzle', component: 'plate', label: 'Nozzle to shell (set-in / set-on)',
    detail: 'Full-penetration nozzle connection into a shell or head.',
    jointKind: 'singleBevel', lengthBasis: 'circ', sizeSource: 'nps',
    ndt: { vt: 100, rt: 0, pt: 20, mt: 20, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'plate_struct', component: 'plate', label: 'Structural attachment (stiffener / bracket)',
    detail: 'Fillet-welded stiffener, clip or bracket to shell or plate.',
    jointKind: 'filletT2', lengthBasis: 'fixed', sizeSource: 'panel',
    ndt: { vt: 100, rt: 0, pt: 0, mt: 20, ut: 0, paut: 0, pmi: 0 },
  },

  // ---------------- tube ----------------
  {
    id: 'tube_ts_strength', component: 'tube', label: 'Tube to tubesheet — strength weld',
    detail: 'Full-strength seal weld around each tube. Length per joint = pi x tube OD.',
    jointKind: 'filletT1', lengthBasis: 'circ', sizeSource: 'tubeOd',
    ndt: { vt: 100, rt: 5, pt: 10, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'tube_ts_seal', component: 'tube', label: 'Tube to tubesheet — seal weld only',
    detail: 'Light seal weld on an expanded tube (no strength credit taken).',
    jointKind: 'filletT1', lengthBasis: 'circ', sizeSource: 'tubeOd',
    ndt: { vt: 100, rt: 0, pt: 10, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'tube_ts_groove', component: 'tube', label: 'Tube to tubesheet — groove weld (protruded tube)',
    detail: 'Tube protruded and welded into a counterbore or groove in the tubesheet.',
    jointKind: 'singleBevel', lengthBasis: 'circ', sizeSource: 'tubeOd',
    ndt: { vt: 100, rt: 5, pt: 10, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
  {
    id: 'tube_tube', component: 'tube', label: 'Tube to tube butt weld',
    detail: 'Orbital or manual butt weld joining two tubes. Length per joint = pi x tube OD.',
    jointKind: 'singleV', lengthBasis: 'circ', sizeSource: 'tubeOd',
    ndt: { vt: 100, rt: 10, pt: 0, mt: 0, ut: 0, paut: 0, pmi: 0 },
  },
];

export const connectionById = (id: string): ConnectionDef =>
  CONNECTIONS.find((c) => c.id === id) ?? CONNECTIONS[0];

export const connectionsFor = (component: ComponentType): ConnectionDef[] =>
  CONNECTIONS.filter((c) => c.component === component);

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  pipe: 'Pipe / piping',
  plate: 'Plate / shell / vessel',
  tube: 'Heat exchanger tube',
};

// ---------------------------------------------------------------------------
// Dissimilar metal joints — filler selection by material group pair
// ---------------------------------------------------------------------------

export interface DissimilarFiller {
  filler: string;
  density: number; // kg/m3 of the deposited weld metal
  note: string;
  compatible: boolean;
}

const RULES: Record<string, DissimilarFiller> = {
  'CS|LAS': { filler: 'E8018-B2 / ER80S-B2', density: 7850, note: 'Match the low-alloy side. PWHT to the Cr-Mo requirement, not the carbon side.', compatible: true },
  'CS|SS': { filler: 'ER309L / E309L-16', density: 7900, note: 'Over-alloyed austenitic filler absorbs carbon dilution from the ferritic side. No preheat; hold interpass <= 150 C.', compatible: true },
  'CS|DSS': { filler: 'ER2209', density: 7800, note: 'Duplex filler; control heat input 0.5-1.5 kJ/mm and check ferrite content. Avoid excessive dilution.', compatible: true },
  'CS|NI': { filler: 'ERNiCrMo-3', density: 8440, note: 'Nickel-based filler tolerates dilution and differential expansion. Low heat input, stringer beads.', compatible: true },
  'CS|CU': { filler: 'ERCuNi', density: 8940, note: 'Nickel-copper filler for carbon steel to 90/10 or 70/30 CuNi.', compatible: true },
  'CS|AL': { filler: 'Transition joint required', density: 2700, note: 'Aluminium cannot be fusion welded directly to steel — use an explosively bonded transition joint.', compatible: false },
  'CS|TI': { filler: 'Not weldable directly', density: 4510, note: 'Titanium forms brittle intermetallics with steel. Use a transition piece or mechanical joint.', compatible: false },
  'LAS|SS': { filler: 'ER309L (or ERNiCr-3 if PWHT required)', density: 7900, note: '309L is not suitable above ~600 C PWHT; use nickel-based filler where stress relief is required.', compatible: true },
  'LAS|DSS': { filler: 'ER2209', density: 7800, note: 'Duplex filler; PWHT of the Cr-Mo side must be completed before the duplex weld.', compatible: true },
  'LAS|NI': { filler: 'ERNiCrMo-3', density: 8440, note: 'Nickel-based filler for Cr-Mo to nickel alloy.', compatible: true },
  'SS|DSS': { filler: 'ER2209', density: 7800, note: 'Duplex filler balances ferrite and austenite across the dilution zone.', compatible: true },
  'SS|NI': { filler: 'ERNiCrMo-3', density: 8440, note: 'Nickel-based filler; both sides austenitic so thermal expansion mismatch is modest.', compatible: true },
  'DSS|NI': { filler: 'ERNiCrMo-3', density: 8440, note: 'Nickel-based filler limits intermetallic formation in the duplex heat-affected zone.', compatible: true },
  'CU|NI': { filler: 'ERNiCu-7', density: 8800, note: 'Nickel-copper filler for CuNi to nickel alloy.', compatible: true },
  'AL|SS': { filler: 'Not weldable directly', density: 2800, note: 'Aluminium to stainless requires a bimetallic transition joint.', compatible: false },
  'TI|SS': { filler: 'Not weldable directly', density: 4510, note: 'Titanium to stainless forms brittle phases; use a transition joint.', compatible: false },
};

/** Tabulated dissimilar combinations, for the reference sheet. */
export const DISSIMILAR_TABLE: ({ pair: string } & DissimilarFiller)[] = Object.entries(RULES).map(
  ([k, v]) => ({ pair: k.replace('|', ' → '), ...v }),
);

/** Returns the dissimilar filler rule for a group pair, or null when the metals match. */
export function dissimilarRule(a: MaterialGroup, b: MaterialGroup): DissimilarFiller | null {
  if (a === b) return null;
  return RULES[`${a}|${b}`] ?? RULES[`${b}|${a}`] ?? {
    filler: 'Consult welding engineer',
    density: 7850,
    note: 'No standard dissimilar combination is tabulated for this pair — a qualified WPS/PQR with a specific filler is required.',
    compatible: false,
  };
}
