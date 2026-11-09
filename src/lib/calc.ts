import {
  MATERIALS,
  PROCESSES,
  POSITIONS,
  JOINT_TYPES,
  NDT_METHODS,
  type JointKind,
  type Material,
  type NdtBasis,
  type NdtMethodDef,
  type Position,
  type Process,
  type ProcessSize,
  type JointTypeDef,
  electrodeMass,
  jointTypeById,
  positionById,
  preheat,
  processById,
  resolveNdtBasis,
  wireMassPerMetre,
} from './data';
import {
  connectionById,
  connectionsFor,
  dissimilarRule,
  type ComponentType,
  type ConnectionDef,
  type DissimilarFiller,
} from './connections';
import { pipeByNps, wallFor } from './pipes';

// ---------------------------------------------------------------------------
// Scenario model
// ---------------------------------------------------------------------------

export type LengthMode = 'circ' | 'fixed';

export interface Scenario {
  id: string;
  tag: string;
  description: string;
  wpsNo: string;
  materialId: string;
  processId: string;
  positionId: string;
  sizeIndex: number;
  jointKind: JointKind;

  // component / connection context
  component: ComponentType;
  connectionId: string;
  nps: number;
  schedule: string;
  tubeOd: number;
  tubeWall: number;
  tubeCount: number;
  tubesheet: number;
  materialId2: string | null;

  // geometry, mm
  thickness: number;
  leg: number;
  includedAngle: number;
  rootGap: number;
  land: number;
  reinforcement: number;
  rootPenetration: number;
  rootRadius: number;
  convexity: number;
  areaOverride: number | null;

  // productivity overrides
  passesOverride: number | null;
  rateOverride: number | null;
  ofOverride: number | null;

  // extent
  lengthMode: LengthMode;
  od: number; // mm (pipe OD); 0 for straight/structural
  joints: number;
  lengthPerJoint: number; // m, used when lengthMode = 'fixed'

  // NDT
  ndtBasis: NdtBasis;
  ndtPct: Record<string, number>;
}

export const uid = (): string => Math.random().toString(36).slice(2, 9);

export function makeScenario(patch: Partial<Scenario> = {}): Scenario {
  const base: Scenario = {
    id: uid(),
    tag: 'S-01',
    description: 'New weld scenario',
    wpsNo: 'WPS-001',
    materialId: 'a106b',
    processId: 'smaw',
    positionId: '1G',
    sizeIndex: 1,
    jointKind: 'singleV',
    component: 'pipe',
    connectionId: 'pipe_pipe',
    nps: 6,
    schedule: '40',
    tubeOd: 25.4,
    tubeWall: 2.11,
    tubeCount: 100,
    tubesheet: 50,
    materialId2: null,
    thickness: 12,
    leg: 8,
    includedAngle: 60,
    rootGap: 2,
    land: 1.5,
    reinforcement: 2,
    rootPenetration: 1.5,
    rootRadius: 6,
    convexity: 0.5,
    areaOverride: null,
    passesOverride: null,
    rateOverride: null,
    ofOverride: null,
    lengthMode: 'fixed',
    od: 0,
    joints: 1,
    lengthPerJoint: 1,
    ndtBasis: 'auto',
    ndtPct: Object.fromEntries(NDT_METHODS.map((m) => [m.id, m.pctDefault])),
  };
  return { ...base, ...patch, ndtPct: { ...base.ndtPct, ...(patch.ndtPct ?? {}) } };
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export interface GeoTeram {
  label: string;
  value: number;
}

export interface Geo {
  grooveArea: number;
  rootPenArea: number;
  reinforceArea: number;
  area: number;
  capWidth: number;
  depth: number;
  overridden: boolean;
  expression: string;
  terms: GeoTeram[];
}

const RAD = Math.PI / 180;

export function computeGeometry(s: Scenario): Geo {
  const b = Math.max(0, s.rootGap);
  const f = Math.max(0, s.land);
  const r = Math.max(0, s.reinforcement);
  const p = Math.max(0, s.rootPenetration);
  const R = Math.max(0, s.rootRadius);
  const t = Math.max(0.1, s.thickness);
  const c = Math.max(0, s.convexity);
  const half = Math.max(0.01, s.includedAngle / 2) * RAD;
  const ta = Math.tan(half);

  let groove = 0;
  let reinf = 0;
  let rootPen = 0;
  let capWidth = b;
  let depth = t;
  let expression = '';
  const terms: GeoTeram[] = [];

  switch (s.jointKind) {
    case 'square': {
      depth = t;
      groove = b * t;
      capWidth = b;
      reinf = (2 / 3) * capWidth * r;
      rootPen = (2 / 3) * b * p;
      expression = 'A = b·t + ⅔·b·(r + p)';
      terms.push({ label: 'b·t (gap × thickness)', value: b * t });
      break;
    }
    case 'singleV': {
      depth = Math.max(t - f, 0);
      groove = b * t + depth * depth * ta;
      capWidth = b + 2 * depth * ta;
      reinf = (2 / 3) * capWidth * r;
      rootPen = (2 / 3) * b * p;
      expression = `A = b·t + (t−f)²·tan(α/2)  [α = ${s.includedAngle}°]`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '(t−f)²·tan(α/2) (V opening)', value: depth * depth * ta });
      break;
    }
    case 'doubleV': {
      depth = Math.max(t / 2 - f, 0);
      groove = b * t + 2 * depth * depth * ta;
      capWidth = b + 2 * depth * ta;
      reinf = 2 * (2 / 3) * capWidth * r;
      rootPen = 0;
      expression = `A = b·t + 2·(t/2−f)²·tan(α/2)  [α = ${s.includedAngle}°]`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '2 × (t/2−f)²·tan(α/2) (both sides)', value: 2 * depth * depth * ta });
      break;
    }
    case 'singleBevel': {
      depth = Math.max(t - f, 0);
      groove = b * t + 0.5 * depth * depth * ta;
      capWidth = b + depth * ta;
      reinf = (2 / 3) * capWidth * r;
      rootPen = (2 / 3) * b * p;
      expression = `A = b·t + ½·(t−f)²·tan(α)  [bevel ${s.includedAngle}°]`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '½·(t−f)²·tan(α) (single flank)', value: 0.5 * depth * depth * ta });
      break;
    }
    case 'doubleBevel': {
      depth = Math.max(t / 2 - f, 0);
      groove = b * t + depth * depth * ta;
      capWidth = b + depth * ta;
      reinf = 2 * (2 / 3) * capWidth * r;
      rootPen = 0;
      expression = `A = b·t + (t/2−f)²·tan(α)  [both sides, bevel ${s.includedAngle}°]`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '(t/2−f)²·tan(α) (two flanks)', value: depth * depth * ta });
      break;
    }
    case 'singleU': {
      depth = Math.max(t - f - R, 0);
      groove = b * t + depth * depth * ta + 0.4292 * R * R;
      capWidth = b + 2 * depth * ta;
      reinf = (2 / 3) * capWidth * r;
      rootPen = (2 / 3) * b * p;
      expression = `A = b·t + (t−f−R)²·tan(α/2) + 0.429·R²`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '(t−f−R)²·tan(α/2) (U flare)', value: depth * depth * ta });
      terms.push({ label: '0.429·R² (root radius fill)', value: 0.4292 * R * R });
      break;
    }
    case 'doubleU': {
      depth = Math.max(t / 2 - f - R, 0);
      groove = b * t + 2 * depth * depth * ta + 2 * 0.4292 * R * R;
      capWidth = b + 2 * depth * ta;
      reinf = 2 * (2 / 3) * capWidth * r;
      rootPen = 0;
      expression = `A = b·t + 2·(t/2−f−R)²·tan(α/2) + 2 × 0.429·R²`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '2 × U flare', value: 2 * depth * depth * ta });
      terms.push({ label: '2 × 0.429·R² (root radii)', value: 2 * 0.4292 * R * R });
      break;
    }
    case 'singleJ': {
      depth = Math.max(t - f - R, 0);
      groove = b * t + 0.5 * depth * depth * ta + 0.4292 * R * R;
      capWidth = b + depth * ta;
      reinf = (2 / 3) * capWidth * r;
      rootPen = (2 / 3) * b * p;
      expression = `A = b·t + ½·(t−f−R)²·tan(α) + 0.429·R²`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '½·(t−f−R)²·tan(α) (J flare)', value: 0.5 * depth * depth * ta });
      terms.push({ label: '0.429·R² (root radius fill)', value: 0.4292 * R * R });
      break;
    }
    case 'doubleJ': {
      depth = Math.max(t / 2 - f - R, 0);
      groove = b * t + depth * depth * ta + 2 * 0.4292 * R * R;
      capWidth = b + depth * ta;
      reinf = 2 * (2 / 3) * capWidth * r;
      rootPen = 0;
      expression = `A = b·t + (t/2−f−R)²·tan(α) + 2 × 0.429·R²`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: 'J flares, both sides', value: depth * depth * ta });
      terms.push({ label: '2 × 0.429·R² (root radii)', value: 2 * 0.4292 * R * R });
      break;
    }
    case 'filletT1':
    case 'filletLap1': {
      const a = Math.max(0.1, s.leg);
      depth = a;
      groove = 0.5 * a * a;
      capWidth = Math.SQRT2 * a;
      reinf = (2 / 3) * capWidth * c;
      rootPen = (2 / 3) * a * p;
      expression = 'A = ½·a² + ⅔·√2·a·c + ⅔·a·p';
      terms.push({ label: '½·a² (theoretical throat triangle)', value: 0.5 * a * a });
      break;
    }
    case 'filletT2':
    case 'filletLap2': {
      const a = Math.max(0.1, s.leg);
      depth = a;
      groove = a * a;
      capWidth = Math.SQRT2 * a;
      reinf = 2 * (2 / 3) * capWidth * c;
      rootPen = 2 * (2 / 3) * a * p;
      expression = 'A = a² + 2 × ⅔·√2·a·c + 2 × ⅔·a·p';
      terms.push({ label: 'a² (both fillets)', value: a * a });
      break;
    }
    case 'corner': {
      depth = Math.max(t - f, 0);
      groove = b * t + 0.5 * depth * depth * ta;
      capWidth = b + depth * ta;
      reinf = (2 / 3) * capWidth * r;
      rootPen = (2 / 3) * b * p;
      expression = `A = b·t + ½·(t−f)²·tan(α)  [corner, ${s.includedAngle}°]`;
      terms.push({ label: 'b·t (root gap column)', value: b * t });
      terms.push({ label: '½·(t−f)²·tan(α)', value: 0.5 * depth * depth * ta });
      break;
    }
    default: {
      groove = b * t;
      expression = 'A = b·t';
    }
  }

  if (reinf > 0) {
    terms.push({
      label: s.jointKind.startsWith('fillet') ? '⅔·w·c (convexity)' : '⅔·w·r (cap reinforcement)',
      value: reinf,
    });
  }
  if (rootPen > 0) terms.push({ label: '⅔·b·p (root penetration)', value: rootPen });

  const calculated = groove + reinf + rootPen;
  const overridden = s.areaOverride !== null && s.areaOverride > 0;
  const area = overridden ? (s.areaOverride as number) : calculated;

  return { grooveArea: groove, rootPenArea: rootPen, reinforceArea: reinf, area, capWidth, depth, overridden, expression, terms };
}

// ---------------------------------------------------------------------------
// Arc efficiency (for heat input)
// ---------------------------------------------------------------------------

const ARC_EFF: Record<string, number> = {
  smaw: 0.8, smaw_cell: 0.8, gtaw: 0.6, gmaw_short: 0.8, gmaw_spray: 0.8,
  fcaw_ss: 0.8, fcaw_gs: 0.8, saw: 0.9, saw_tandem: 0.9, egw: 0.9,
};

// ---------------------------------------------------------------------------
// NDT
// ---------------------------------------------------------------------------

export interface NdtLine {
  method: NdtMethodDef;
  pct: number;
  jointsTested: number;
  metres: number;
  hours: number;
  films: number;
}

export interface NdtResult {
  basis: 'linear' | 'joint';
  lines: NdtLine[];
  hours: number;
  metres: number;
  joints: number;
  films: number;
}

const FILM_EFFECTIVE_M = 0.3; // 300 mm film, ~20 % overlap → 0.30 m effective length

export function computeNdt(s: Scenario, totalLength: number, joints: number, lengthPerJoint: number): NdtResult {
  const isStraight = s.lengthMode === 'fixed' && s.od <= 0;
  const basis = resolveNdtBasis(s.ndtBasis, s.od, isStraight);
  const circ = s.od > 0 ? (Math.PI * s.od) / 1000 : lengthPerJoint;
  const lines: NdtLine[] = [];

  for (const m of NDT_METHODS) {
    const pct = s.ndtPct[m.id] ?? 0;
    if (pct <= 0) continue;

    let jointsTested = 0;
    let metres = 0;
    let hours = 0;
    let films = 0;

    if (basis === 'linear') {
      metres = (totalLength * pct) / 100;
      jointsTested = lengthPerJoint > 0 ? metres / lengthPerJoint : 0;
      hours = metres * m.hoursPerMetre;
      if (m.id === 'rt') {
        films = Math.ceil(metres / FILM_EFFECTIVE_M);
      }
    } else {
      jointsTested = Math.ceil((joints * pct) / 100);
      metres = jointsTested * lengthPerJoint;
      hours = jointsTested * m.hoursPerJoint;
      if (m.id === 'rt') {
        const perJoint = circ <= 0 ? 1 : Math.max(3, Math.ceil(circ / FILM_EFFECTIVE_M));
        films = perJoint * jointsTested;
      }
    }

    lines.push({ method: m, pct, jointsTested, metres, hours, films });
  }

  return {
    basis,
    lines,
    hours: lines.reduce((a, l) => a + l.hours, 0),
    metres: lines.reduce((a, l) => a + l.metres, 0),
    joints: lines.reduce((a, l) => a + l.jointsTested, 0),
    films: lines.reduce((a, l) => a + l.films, 0),
  };
}

// ---------------------------------------------------------------------------
// Full scenario result
// ---------------------------------------------------------------------------

export interface ScenarioResult {
  s: Scenario;
  material: Material;
  material2: Material | null;
  dissimilar: DissimilarFiller | null;
  fillerLabel: string;
  density: number;
  connection: ConnectionDef;
  process: Process;
  position: Position;
  jt: JointTypeDef;
  size: ProcessSize;
  geo: Geo;

  lengthPerJoint: number;
  totalLength: number;
  joints: number;
  passesPerJoint: number;
  totalPasses: number;

  volume: number; // mm3
  deposit: number; // kg
  depositPerMetre: number; // kg/m
  passes: number;

  grossConsumable: number; // kg
  wireLength: number | null; // m
  electrodeCount: number | null; // pcs
  flux: number | null; // kg
  gas: number | null; // m3

  arcRate: number; // kg/h
  operatingFactor: number;
  arcTime: number; // h
  weldingHours: number; // h
  hoursPerMetre: number;
  hoursPerJoint: number;

  heatInput: number; // kJ/mm
  hiLimit: number;
  hiExceeded: boolean;

  preheatMin: number;
  preheatMax: number;
  preheatNote: string;

  ndt: NdtResult;
}

function combinePreheat(a: Material, b: Material | null, t: number) {
  const pa = preheat(a, t);
  if (!b) return pa;
  const pb = preheat(b, t);
  const austenitic = (m: Material) => m.group === 'SS' || m.group === 'NI' || m.group === 'DSS';
  if (austenitic(a) && !austenitic(b)) {
    return { ...pb, note: `${pb.note} Austenitic side: no preheat, hold interpass ≤ 150 °C.` };
  }
  if (austenitic(b) && !austenitic(a)) {
    return { ...pa, note: `${pa.note} Austenitic side: no preheat, hold interpass ≤ 150 °C.` };
  }
  const min = Math.max(pa.min, pb.min);
  return { min, max: Math.max(min + 50, pa.max, pb.max), note: `Governed by the more demanding side. ${pa.note}` };
}

function combineHiLimit(a: Material, b: Material | null): number {
  if (!b) return a.maxHI;
  const limits = [a.maxHI, b.maxHI].filter((v) => v > 0);
  return limits.length ? Math.min(...limits) : 0;
}

/** Re-applies the size implied by the connection and the selected pipe / tube dimensions. */
export function applyComponentSize(s: Scenario): Scenario {
  const conn = connectionById(s.connectionId);
  const next: Scenario = { ...s };
  if (conn.component === 'pipe') {
    next.od = pipeByNps(s.nps)?.od ?? s.od;
    next.thickness = wallFor(s.nps, s.schedule) || s.thickness;
    next.lengthMode = 'circ';
  } else if (conn.component === 'tube') {
    next.od = s.tubeOd;
    next.thickness = s.tubeWall;
    next.joints = s.tubeCount;
    next.lengthMode = 'circ';
  } else {
    next.lengthMode = conn.lengthBasis;
    if (conn.sizeSource === 'nps') {
      next.od = pipeByNps(s.nps)?.od ?? s.od;
      next.thickness = wallFor(s.nps, s.schedule) || s.thickness;
    }
  }
  return next;
}

/** Switches connection, adopting its joint type and NDT defaults. */
export function applyConnection(s: Scenario, connectionId: string): Scenario {
  const conn = connectionById(connectionId);
  return applyComponentSize({
    ...s,
    connectionId,
    component: conn.component,
    jointKind: conn.jointKind,
    ndtPct: { ...s.ndtPct, ...conn.ndt },
  });
}

/** Switches component type, moving to the first connection of that family. */
export function applyComponent(s: Scenario, component: ComponentType): Scenario {
  const first = connectionsFor(component)[0];
  if (!first) return s;
  return applyConnection({ ...s, component }, first.id);
}

/** Weld length per joint, derived from the connection and the component dimensions. */
export function lengthOf(s: Scenario, conn: ConnectionDef): number {
  if (conn.sizeSource === 'tubeOd') return (Math.PI * Math.max(s.tubeOd, 0.1)) / 1000;
  if (conn.lengthBasis === 'circ') {
    const d = conn.sizeSource === 'nps' ? (pipeByNps(s.nps)?.od ?? s.od) : s.od;
    return (Math.PI * Math.max(d, 0.1)) / 1000;
  }
  return Math.max(s.lengthPerJoint, 0.001);
}

export function computeScenario(s: Scenario): ScenarioResult {
  const material = MATERIALS.find((m) => m.id === s.materialId) ?? MATERIALS[0];
  const material2 = s.materialId2 ? MATERIALS.find((m) => m.id === s.materialId2) ?? null : null;
  const dissimilar = material2 ? dissimilarRule(material.group, material2.group) : null;
  const density = dissimilar ? dissimilar.density : material.density;
  const connection = connectionById(s.connectionId);
  const process = processById(s.processId);
  const position = positionById(s.positionId);
  const jt = jointTypeById(s.jointKind);
  const size = process.sizes[Math.min(Math.max(s.sizeIndex, 0), process.sizes.length - 1)] ?? process.sizes[0];
  const geo = computeGeometry(s);

  const lengthPerJoint = lengthOf(s, connection);
  const joints = Math.max(0, connection.sizeSource === 'tubeOd' ? s.tubeCount || s.joints : s.joints);
  const totalLength = lengthPerJoint * joints; // m

  const volume = geo.area * totalLength * 1000; // mm² × mm
  const deposit = volume * density * 1e-9; // kg
  const depositPerMetre = totalLength > 0 ? deposit / totalLength : 0;

  const passesPerJoint = s.passesOverride && s.passesOverride > 0 ? s.passesOverride : Math.max(1, Math.ceil(geo.area / process.passArea));
  const totalPasses = Math.round(passesPerJoint * joints);

  const eff = process.efficiency;
  const grossConsumable = deposit / eff;
  let wireLength: number | null = null;
  let electrodeCount: number | null = null;
  let flux: number | null = null;
  let gas: number | null = null;

  if (process.form === 'electrode') {
    const rodLen = size.dia <= 3.2 ? 350 : 450;
    const perRod = electrodeMass(size.dia, rodLen);
    electrodeCount = Math.ceil(grossConsumable / perRod);
  } else {
    const massPerM = wireMassPerMetre(size.dia, density);
    wireLength = massPerM > 0 ? grossConsumable / massPerM : null;
  }
  if (process.fluxRatio > 0) flux = grossConsumable * process.fluxRatio;

  const arcRate = s.rateOverride && s.rateOverride > 0 ? s.rateOverride : size.rate * position.factor;
  const operatingFactor = s.ofOverride && s.ofOverride > 0 ? s.ofOverride : process.operatingFactor;
  const arcTime = arcRate > 0 ? deposit / arcRate : 0;
  const weldingHours = operatingFactor > 0 ? arcTime / operatingFactor : 0;

  if (process.gasFlow > 0) gas = (process.gasFlow * 60 * arcTime) / 1000; // L/min × h → m³

  const k = ARC_EFF[process.id] ?? 0.8;
  const heatInput = process.travel > 0 ? (k * process.voltage * process.current * 60) / (1000 * process.travel) : 0;
  const hiLimit = combineHiLimit(material, material2);

  const ph = combinePreheat(material, material2, s.thickness);

  const ndt = computeNdt(s, totalLength, joints, lengthPerJoint);

  return {
    s, material, material2, dissimilar, density, connection,
    fillerLabel: dissimilar ? dissimilar.filler : material.filler,
    process, position, jt, size, geo,
    lengthPerJoint, totalLength, joints, passesPerJoint, totalPasses,
    volume, deposit, depositPerMetre, passes: totalPasses,
    grossConsumable, wireLength, electrodeCount, flux, gas,
    arcRate, operatingFactor, arcTime, weldingHours,
    hoursPerMetre: totalLength > 0 ? weldingHours / totalLength : 0,
    hoursPerJoint: joints > 0 ? weldingHours / joints : 0,
    heatInput, hiLimit, hiExceeded: hiLimit > 0 && heatInput > hiLimit,
    preheatMin: ph.min, preheatMax: ph.max, preheatNote: ph.note,
    ndt,
  };
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export interface Totals {
  scenarios: number;
  joints: number;
  length: number;
  volume: number;
  deposit: number;
  grossConsumable: number;
  wireLength: number;
  electrodeCount: number;
  flux: number;
  gas: number;
  arcTime: number;
  weldingHours: number;
  passes: number;
  ndtHours: number;
  ndtMetres: number;
  ndtJoints: number;
  films: number;
}

export function computeTotals(results: ScenarioResult[]): Totals {
  const t: Totals = {
    scenarios: results.length, joints: 0, length: 0, volume: 0, deposit: 0, grossConsumable: 0,
    wireLength: 0, electrodeCount: 0, flux: 0, gas: 0, arcTime: 0, weldingHours: 0, passes: 0,
    ndtHours: 0, ndtMetres: 0, ndtJoints: 0, films: 0,
  };
  for (const r of results) {
    t.joints += r.joints;
    t.length += r.totalLength;
    t.volume += r.volume;
    t.deposit += r.deposit;
    t.grossConsumable += r.grossConsumable;
    t.wireLength += r.wireLength ?? 0;
    t.electrodeCount += r.electrodeCount ?? 0;
    t.flux += r.flux ?? 0;
    t.gas += r.gas ?? 0;
    t.arcTime += r.arcTime;
    t.weldingHours += r.weldingHours;
    t.passes += r.totalPasses;
    t.ndtHours += r.ndt.hours;
    t.ndtMetres += r.ndt.metres;
    t.ndtJoints += r.ndt.joints;
    t.films += r.ndt.films;
  }
  return t;
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export function resultsCsv(results: ScenarioResult[]): string {
  const head = [
    'Tag', 'Description', 'WPS', 'Component', 'Connection', 'Material', 'Material B',
    'Filler', 'Process', 'Position', 'Joint type',
    'Thickness (mm)', 'Leg (mm)', 'Included angle (deg)', 'Gap (mm)', 'Land (mm)',
    'Cross-section area (mm2)', 'Length/joint (m)', 'Joints', 'Total length (m)',
    'Passes/joint', 'Total passes', 'Weld volume (mm3)', 'Deposit weight (kg)',
    'Deposit per metre (kg/m)', 'Gross consumable (kg)', 'Wire length (m)',
    'Electrode qty (pcs)', 'Flux (kg)', 'Shielding gas (m3)', 'Arc rate (kg/h)',
    'Arc time (h)', 'Operating factor', 'Welding hours (h)', 'Hours per metre (h/m)',
    'Hours per joint (h)', 'Heat input (kJ/mm)', 'Max HI (kJ/mm)',
    'Preheat min (degC)', 'Preheat max (degC)', 'NDT basis', 'NDT metres',
    'NDT joints', 'RT films', 'NDT hours',
  ];
  const rows = results.map((r) => [
    r.s.tag, r.s.description, r.s.wpsNo, r.s.component, r.connection.label,
    r.material.name, r.material2 ? r.material2.name : '', r.fillerLabel,
    r.process.abbr, r.position.id, r.jt.label,
    r.s.thickness, r.s.leg, r.s.includedAngle, r.s.rootGap, r.s.land,
    r.geo.area.toFixed(1), r.lengthPerJoint.toFixed(3), r.joints, r.totalLength.toFixed(3),
    r.passesPerJoint, r.totalPasses, r.volume.toFixed(0), r.deposit.toFixed(3),
    r.depositPerMetre.toFixed(3), r.grossConsumable.toFixed(3), (r.wireLength ?? 0).toFixed(1),
    r.electrodeCount ?? 0, (r.flux ?? 0).toFixed(2), (r.gas ?? 0).toFixed(2), r.arcRate.toFixed(2),
    r.arcTime.toFixed(2), r.operatingFactor.toFixed(2), r.weldingHours.toFixed(2),
    r.hoursPerMetre.toFixed(3), r.hoursPerJoint.toFixed(2), r.heatInput.toFixed(2),
    r.hiLimit, r.preheatMin, r.preheatMax, r.ndt.basis, r.ndt.metres.toFixed(2),
    r.ndt.joints.toFixed(1), r.ndt.films, r.ndt.hours.toFixed(2),
  ]);
  return [head, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}
