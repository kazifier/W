// ---------------------------------------------------------------------------
// Welding engineering reference data
// Values are typical/indicative figures taken from common industry practice
// (ASME BPVC IX & B31.3, AWS D1.1 / A5.x, API 1104, ISO 9692-1, ISO 5817,
// Lincoln / ESAB consumable data sheets).  Every default is editable in the UI
// so a project-specific WPS/PQR can override it.
// ---------------------------------------------------------------------------

export type MaterialGroup = 'CS' | 'LAS' | 'SS' | 'DSS' | 'NI' | 'AL' | 'CU' | 'TI';

export interface Material {
  id: string;
  name: string;
  spec: string;
  group: MaterialGroup;
  density: number; // kg/m3
  smys: number; // MPa
  uts: number; // MPa
  ce: number; // IIW carbon equivalent, typical mid-range
  maxHI: number; // max recommended heat input kJ/mm (0 = not limited)
  filler: string; // matching filler metal
}

export const MATERIALS: Material[] = [
  { id: 'a36', name: 'Carbon steel A36', spec: 'ASTM A36', group: 'CS', density: 7850, smys: 250, uts: 400, ce: 0.28, maxHI: 45, filler: 'E7018 / ER70S-6' },
  { id: 'a106b', name: 'Carbon steel A106 Gr.B', spec: 'ASTM A106-B', group: 'CS', density: 7850, smys: 240, uts: 415, ce: 0.42, maxHI: 40, filler: 'E7018-1 / ER70S-6' },
  { id: 'a516_70', name: 'PV plate A516 Gr.70', spec: 'ASTM A516-70', group: 'CS', density: 7850, smys: 260, uts: 485, ce: 0.45, maxHI: 35, filler: 'E7018-1 / F7A4-EH14' },
  { id: 'a105', name: 'Forging A105', spec: 'ASTM A105', group: 'CS', density: 7850, smys: 250, uts: 485, ce: 0.40, maxHI: 40, filler: 'E7018-1' },
  { id: 'x42', name: 'Line pipe API 5L X42', spec: 'API 5L X42 PSL2', group: 'CS', density: 7850, smys: 290, uts: 415, ce: 0.34, maxHI: 40, filler: 'E8010-G / ER80S-G' },
  { id: 'x52', name: 'Line pipe API 5L X52', spec: 'API 5L X52 PSL2', group: 'CS', density: 7850, smys: 359, uts: 455, ce: 0.38, maxHI: 35, filler: 'E8010-G / ER80S-G' },
  { id: 'x60', name: 'Line pipe API 5L X60', spec: 'API 5L X60 PSL2', group: 'CS', density: 7850, smys: 414, uts: 517, ce: 0.41, maxHI: 30, filler: 'E8010-G / ER80S-G' },
  { id: 'x65', name: 'Line pipe API 5L X65', spec: 'API 5L X65 PSL2', group: 'CS', density: 7850, smys: 448, uts: 531, ce: 0.43, maxHI: 25, filler: 'E9010-G / ER90S-G' },
  { id: 'x70', name: 'Line pipe API 5L X70', spec: 'API 5L X70 PSL2', group: 'CS', density: 7850, smys: 483, uts: 565, ce: 0.45, maxHI: 20, filler: 'E10010-G / ER100S-G' },
  { id: 'a387_11', name: '1.25Cr-0.5Mo', spec: 'ASTM A387 Gr.11 Cl.2', group: 'LAS', density: 7850, smys: 310, uts: 515, ce: 0.55, maxHI: 25, filler: 'E8018-B2 / ER80S-B2' },
  { id: 'a387_22', name: '2.25Cr-1Mo', spec: 'ASTM A387 Gr.22 Cl.2', group: 'LAS', density: 7850, smys: 310, uts: 515, ce: 0.62, maxHI: 20, filler: 'E9018-B3 / ER90S-B3' },
  { id: 'ss304l', name: 'Stainless 304L', spec: 'ASTM A312 TP304L', group: 'SS', density: 7930, smys: 170, uts: 485, ce: 0, maxHI: 15, filler: 'ER308L / E308L-16' },
  { id: 'ss316l', name: 'Stainless 316L', spec: 'ASTM A312 TP316L', group: 'SS', density: 8000, smys: 170, uts: 485, ce: 0, maxHI: 15, filler: 'ER316L / E316L-16' },
  { id: 'ss321', name: 'Stabilised 321', spec: 'ASTM A312 TP321', group: 'SS', density: 7930, smys: 205, uts: 515, ce: 0, maxHI: 15, filler: 'ER347' },
  { id: 'ss904l', name: 'Super-austenitic 904L', spec: 'ASTM B673 N08904', group: 'SS', density: 8000, smys: 220, uts: 490, ce: 0, maxHI: 12, filler: 'ERNiCrMo-3 / ER385' },
  { id: 'duplex2205', name: 'Duplex 2205', spec: 'ASTM A928 S31803', group: 'DSS', density: 7800, smys: 450, uts: 620, ce: 0, maxHI: 12, filler: 'ER2209' },
  { id: 'superduplex', name: 'Super duplex 2507', spec: 'ASTM A928 S32750', group: 'DSS', density: 7800, smys: 550, uts: 795, ce: 0, maxHI: 10, filler: 'ER2594' },
  { id: 'in625', name: 'Nickel alloy 625', spec: 'ASTM B444 N06625', group: 'NI', density: 8440, smys: 414, uts: 827, ce: 0, maxHI: 15, filler: 'ERNiCrMo-3' },
  { id: 'in825', name: 'Nickel alloy 825', spec: 'ASTM B423 N08825', group: 'NI', density: 8140, smys: 241, uts: 586, ce: 0, maxHI: 15, filler: 'ERNiCrMo-3' },
  { id: 'monel400', name: 'Monel 400', spec: 'ASTM B127 N04400', group: 'NI', density: 8800, smys: 170, uts: 480, ce: 0, maxHI: 15, filler: 'ERNiCu-7' },
  { id: 'al5083', name: 'Aluminium 5083-H116', spec: 'ASTM B928 5083', group: 'AL', density: 2660, smys: 125, uts: 275, ce: 0, maxHI: 8, filler: 'ER5183 / ER5356' },
  { id: 'al6061', name: 'Aluminium 6061-T6', spec: 'ASTM B221 6061', group: 'AL', density: 2700, smys: 240, uts: 290, ce: 0, maxHI: 8, filler: 'ER5356' },
  { id: 'cuni9010', name: 'CuNi 90/10', spec: 'ASTM B466 C70600', group: 'CU', density: 8940, smys: 105, uts: 275, ce: 0, maxHI: 15, filler: 'ERCuNi' },
  { id: 'cuni7030', name: 'CuNi 70/30', spec: 'ASTM B466 C71500', group: 'CU', density: 8940, smys: 125, uts: 370, ce: 0, maxHI: 15, filler: 'ERCuNi' },
  { id: 'ti_gr2', name: 'Titanium Gr.2', spec: 'ASTM B338 Gr.2', group: 'TI', density: 4510, smys: 275, uts: 345, ce: 0, maxHI: 10, filler: 'ERTi-2' },
];

// ---------------------------------------------------------------------------
// Welding processes
// ---------------------------------------------------------------------------

export type FillerForm = 'electrode' | 'wire' | 'rod';

export interface ProcessSize {
  label: string;
  dia: number; // mm
  rate: number; // kg/h arc (deposition) time, flat position
}

export interface Process {
  id: string;
  name: string;
  abbr: string;
  form: FillerForm;
  efficiency: number; // deposited / consumed (stub, spatter, tip loss)
  operatingFactor: number; // arc-on time / total paid time
  passArea: number; // typical bead cross-section per pass, mm2 (flat)
  current: number; // A
  voltage: number; // V
  travel: number; // mm/min
  gasFlow: number; // L/min shielding gas (0 = none)
  fluxRatio: number; // kg flux per kg wire (0 = none)
  sizes: ProcessSize[];
  notes: string;
}

export const PROCESSES: Process[] = [
  {
    id: 'smaw', name: 'Shielded metal arc (stick)', abbr: 'SMAW', form: 'electrode',
    efficiency: 0.65, operatingFactor: 0.30, passArea: 32, current: 130, voltage: 24, travel: 150,
    gasFlow: 0, fluxRatio: 0,
    sizes: [{ label: '2.5 mm', dia: 2.5, rate: 0.9 }, { label: '3.2 mm', dia: 3.2, rate: 1.5 }, { label: '4.0 mm', dia: 4.0, rate: 2.1 }, { label: '5.0 mm', dia: 5.0, rate: 2.7 }],
    notes: 'All-position workhorse. Low operating factor (electrode changes, slag removal) drives man-hours up.',
  },
  {
    id: 'smaw_cell', name: 'SMAW cellulosic (pipe root)', abbr: 'SMAW-C', form: 'electrode',
    efficiency: 0.55, operatingFactor: 0.28, passArea: 26, current: 110, voltage: 26, travel: 120,
    gasFlow: 0, fluxRatio: 0,
    sizes: [{ label: '3.2 mm', dia: 3.2, rate: 0.8 }, { label: '4.0 mm', dia: 4.0, rate: 1.1 }],
    notes: 'E6010/E8010 vertical-down root pass on line pipe. Highest spatter / stub loss.',
  },
  {
    id: 'gtaw', name: 'Gas tungsten arc', abbr: 'GTAW', form: 'rod',
    efficiency: 0.98, operatingFactor: 0.35, passArea: 16, current: 130, voltage: 14, travel: 80,
    gasFlow: 12, fluxRatio: 0,
    sizes: [{ label: '1.6 mm', dia: 1.6, rate: 0.15 }, { label: '2.4 mm', dia: 2.4, rate: 0.28 }, { label: '3.2 mm', dia: 3.2, rate: 0.45 }],
    notes: 'Root / thin-wall and stainless, duplex, nickel, titanium. Very low deposition rate.',
  },
  {
    id: 'gmaw_short', name: 'GMAW short-circuit', abbr: 'GMAW-S', form: 'wire',
    efficiency: 0.93, operatingFactor: 0.45, passArea: 22, current: 170, voltage: 22, travel: 250,
    gasFlow: 15, fluxRatio: 0,
    sizes: [{ label: '0.8 mm', dia: 0.8, rate: 1.4 }, { label: '1.0 mm', dia: 1.0, rate: 2.0 }, { label: '1.2 mm', dia: 1.2, rate: 2.8 }],
    notes: 'Sheet / thin section, out-of-position. Not suitable for heavy section root fusion.',
  },
  {
    id: 'gmaw_spray', name: 'GMAW spray transfer', abbr: 'GMAW', form: 'wire',
    efficiency: 0.95, operatingFactor: 0.50, passArea: 30, current: 260, voltage: 28, travel: 350,
    gasFlow: 18, fluxRatio: 0,
    sizes: [{ label: '1.2 mm', dia: 1.2, rate: 3.6 }, { label: '1.6 mm', dia: 1.6, rate: 5.2 }],
    notes: 'High-productivity semi-automatic; flat/horizontal only for spray transfer.',
  },
  {
    id: 'fcaw_ss', name: 'FCAW self-shielded', abbr: 'FCAW-S', form: 'wire',
    efficiency: 0.85, operatingFactor: 0.45, passArea: 30, current: 220, voltage: 24, travel: 200,
    gasFlow: 0, fluxRatio: 0,
    sizes: [{ label: '1.2 mm', dia: 1.2, rate: 2.4 }, { label: '1.6 mm', dia: 1.6, rate: 3.4 }, { label: '2.0 mm', dia: 2.0, rate: 4.2 }],
    notes: 'Structural / field work, tolerant of wind. Higher fume and slag loss.',
  },
  {
    id: 'fcaw_gs', name: 'FCAW gas-shielded', abbr: 'FCAW-G', form: 'wire',
    efficiency: 0.88, operatingFactor: 0.45, passArea: 34, current: 250, voltage: 26, travel: 220,
    gasFlow: 20, fluxRatio: 0,
    sizes: [{ label: '1.2 mm', dia: 1.2, rate: 2.6 }, { label: '1.6 mm', dia: 1.6, rate: 3.6 }, { label: '2.0 mm', dia: 2.0, rate: 4.6 }],
    notes: 'Best all-round semi-automatic for plate; good deposition with less cleaning than SMAW.',
  },
  {
    id: 'saw', name: 'Submerged arc, single wire', abbr: 'SAW', form: 'wire',
    efficiency: 0.99, operatingFactor: 0.70, passArea: 70, current: 600, voltage: 32, travel: 500,
    gasFlow: 0, fluxRatio: 0.9,
    sizes: [{ label: '2.4 mm', dia: 2.4, rate: 5.5 }, { label: '3.2 mm', dia: 3.2, rate: 8.5 }, { label: '4.0 mm', dia: 4.0, rate: 12.0 }],
    notes: 'Mechanised flat-position long seams and vessel girths. Flux consumption ≈ wire weight.',
  },
  {
    id: 'saw_tandem', name: 'SAW tandem / multi-wire', abbr: 'SAW-T', form: 'wire',
    efficiency: 0.99, operatingFactor: 0.75, passArea: 90, current: 1000, voltage: 34, travel: 800,
    gasFlow: 0, fluxRatio: 1.1,
    sizes: [{ label: '3.2 mm', dia: 3.2, rate: 16.0 }, { label: '4.0 mm', dia: 4.0, rate: 22.0 }],
    notes: 'Highest deposition for straight long seams (pipe mill, wind tower).',
  },
  {
    id: 'egw', name: 'Electrogas / electroslag', abbr: 'EGW', form: 'wire',
    efficiency: 0.98, operatingFactor: 0.65, passArea: 120, current: 500, voltage: 30, travel: 250,
    gasFlow: 0, fluxRatio: 0,
    sizes: [{ label: '1.6 mm', dia: 1.6, rate: 9.0 }, { label: '2.0 mm', dia: 2.0, rate: 12.0 }],
    notes: 'Single-pass vertical butt welds on thick plate (shipbuilding, storage tanks).',
  },
];

export const processById = (id: string): Process => PROCESSES.find((p) => p.id === id) ?? PROCESSES[0];

// ---------------------------------------------------------------------------
// Welding positions — deposition-rate derating
// ---------------------------------------------------------------------------

export interface Position {
  id: string;
  label: string;
  factor: number; // multiplier on flat-position deposition rate
}

export const POSITIONS: Position[] = [
  { id: '1G', label: '1G / 1F — flat', factor: 1.0 },
  { id: '2G', label: '2G / 2F — horizontal', factor: 0.88 },
  { id: '3G', label: '3G / 3F — vertical', factor: 0.72 },
  { id: '4G', label: '4G / 4F — overhead', factor: 0.62 },
  { id: '5G', label: '5G — pipe fixed, horizontal', factor: 0.76 },
  { id: '6G', label: '6G — pipe fixed, 45° inclined', factor: 0.66 },
];

export const positionById = (id: string): Position => POSITIONS.find((p) => p.id === id) ?? POSITIONS[0];

// ---------------------------------------------------------------------------
// Joint / groove configurations
// ---------------------------------------------------------------------------

export type JointKind =
  | 'square'
  | 'singleV'
  | 'doubleV'
  | 'singleBevel'
  | 'doubleBevel'
  | 'singleU'
  | 'doubleU'
  | 'singleJ'
  | 'doubleJ'
  | 'filletT1'
  | 'filletT2'
  | 'filletLap1'
  | 'filletLap2'
  | 'corner';

export interface JointTypeDef {
  id: JointKind;
  label: string;
  short: string;
  usesAngle: boolean;
  usesLand: boolean;
  usesGap: boolean;
  usesRadius: boolean;
  usesLeg: boolean;
  angle: number; // included angle, degrees
  gap: number; // root gap, mm
  land: number; // root face / land, mm
  radius: number; // root radius (U / J), mm
  pass: string; // typical application range
}

export const JOINT_TYPES: JointTypeDef[] = [
  { id: 'square', label: 'Square butt (closed / open square)', short: 'SQ', usesAngle: false, usesLand: false, usesGap: true, usesRadius: false, usesLeg: false, angle: 0, gap: 2, land: 0, radius: 0, pass: 't ≤ 4 mm, thin sheet & small bore' },
  { id: 'singleV', label: 'Single V butt', short: 'V', usesAngle: true, usesLand: true, usesGap: true, usesRadius: false, usesLeg: false, angle: 60, gap: 2, land: 1.5, radius: 0, pass: 't = 3–20 mm, all positions' },
  { id: 'doubleV', label: 'Double V butt', short: '2V', usesAngle: true, usesLand: true, usesGap: true, usesRadius: false, usesLeg: false, angle: 60, gap: 2, land: 1.5, radius: 0, pass: 't = 12–60 mm, both sides accessible' },
  { id: 'singleBevel', label: 'Single bevel butt', short: 'SB', usesAngle: true, usesLand: true, usesGap: true, usesRadius: false, usesLeg: false, angle: 45, gap: 2, land: 1.5, radius: 0, pass: 'T-joints, corner joints, nozzles' },
  { id: 'doubleBevel', label: 'Double bevel butt', short: 'DB', usesAngle: true, usesLand: true, usesGap: true, usesRadius: false, usesLeg: false, angle: 45, gap: 2, land: 1.5, radius: 0, pass: 't > 20 mm, both sides accessible' },
  { id: 'singleU', label: 'Single U butt', short: 'U', usesAngle: true, usesLand: true, usesGap: true, usesRadius: true, usesLeg: false, angle: 20, gap: 2, land: 0, radius: 6, pass: 't = 12–60 mm, thick wall pipe / vessels' },
  { id: 'doubleU', label: 'Double U butt', short: '2U', usesAngle: true, usesLand: true, usesGap: true, usesRadius: true, usesLeg: false, angle: 20, gap: 2, land: 0, radius: 6, pass: 't = 30–100 mm, heavy wall' },
  { id: 'singleJ', label: 'Single J butt', short: 'J', usesAngle: true, usesLand: true, usesGap: true, usesRadius: true, usesLeg: false, angle: 40, gap: 2, land: 0, radius: 6, pass: 'T-joints on thick plate, nozzle necks' },
  { id: 'doubleJ', label: 'Double J butt', short: '2J', usesAngle: true, usesLand: true, usesGap: true, usesRadius: true, usesLeg: false, angle: 40, gap: 2, land: 0, radius: 6, pass: 'Heavy fabrication, both sides access' },
  { id: 'filletT1', label: 'Fillet — T-joint, single side', short: 'FT1', usesAngle: false, usesLand: false, usesGap: false, usesRadius: false, usesLeg: true, angle: 0, gap: 0, land: 0, radius: 0, pass: 'Stiffeners, brackets, structural' },
  { id: 'filletT2', label: 'Fillet — T-joint, both sides', short: 'FT2', usesAngle: false, usesLand: false, usesGap: false, usesRadius: false, usesLeg: true, angle: 0, gap: 0, land: 0, radius: 0, pass: 'Structural members, full double fillet' },
  { id: 'filletLap1', label: 'Fillet — lap joint, single side', short: 'FL1', usesAngle: false, usesLand: false, usesGap: false, usesRadius: false, usesLeg: true, angle: 0, gap: 0, land: 0, radius: 0, pass: 'Sheet / plate overlap, tanks' },
  { id: 'filletLap2', label: 'Fillet — lap joint, both sides', short: 'FL2', usesAngle: false, usesLand: false, usesGap: false, usesRadius: false, usesLeg: true, angle: 0, gap: 0, land: 0, radius: 0, pass: 'Overlap welded both edges' },
  { id: 'corner', label: 'Corner joint (single bevel corner)', short: 'CR', usesAngle: true, usesLand: true, usesGap: true, usesRadius: false, usesLeg: false, angle: 45, gap: 2, land: 1.5, radius: 0, pass: 'Box sections, tank corners, hoppers' },
];

export const jointTypeById = (id: JointKind): JointTypeDef =>
  JOINT_TYPES.find((j) => j.id === id) ?? JOINT_TYPES[1];

// ---------------------------------------------------------------------------
// Consumable helpers
// ---------------------------------------------------------------------------

/** Mass of a stick electrode including flux coating, kg. Coating factor ≈ 3.0 for E7018/E308L-16. */
export function electrodeMass(dia: number, lengthMm: number): number {
  const core = ((Math.PI / 4) * dia * dia * lengthMm * 7.85e-6);
  return core * 3.0;
}

/** Mass per metre of solid wire / rod, kg/m. */
export function wireMassPerMetre(dia: number, density: number): number {
  return (Math.PI / 4) * dia * dia * 1000 * density * 1e-9;
}

// ---------------------------------------------------------------------------
// Preheat recommendation
// ---------------------------------------------------------------------------

export function preheat(material: Material, thickness: number): { min: number; max: number; note: string } {
  const g = material.group;
  if (g === 'LAS') {
    const min = thickness <= 12 ? 100 : thickness <= 25 ? 150 : 200;
    return { min, max: min + 50, note: 'Cr-Mo steel: controlled preheat and PWHT per ASME B31.3 Table 331.1.1 / WPS.' };
  }
  if (g === 'SS' || g === 'NI') {
    return { min: 10, max: 15, note: 'No preheat required (ambient above 10 °C); control interpass ≤ 150 °C and heat input.' };
  }
  if (g === 'DSS') {
    return { min: 10, max: 20, note: 'Duplex: no preheat; keep interpass ≤ 150 °C and heat input 0.5–1.5 kJ/mm.' };
  }
  if (g === 'AL' || g === 'CU' || g === 'TI') {
    return { min: 10, max: 20, note: 'Non-ferrous: ambient, dry and clean; titanium needs trailing / purge shielding.' };
  }
  let min = 10;
  if (thickness > 25 && thickness <= 50) min = 50;
  else if (thickness > 50) min = 100;
  if (material.ce >= 0.45 && min < 100) min = 100;
  return {
    min,
    max: min === 10 ? 20 : min + 50,
    note: min === 10 ? 'No preheat for t ≤ 25 mm with CE < 0.45; dry surfaces.' : 'Preheat per AWS D1.1 Table 3.2 / ASME B31.3 Table 330.1.1.',
  };
}

// ---------------------------------------------------------------------------
// NDT methods
// ---------------------------------------------------------------------------

export interface NdtMethodDef {
  id: string;
  name: string;
  abbr: string;
  pctDefault: number;
  hoursPerJoint: number;
  hoursPerMetre: number;
  basis: string; // typical standard basis
}

export const NDT_METHODS: NdtMethodDef[] = [
  { id: 'vt', name: 'Visual testing', abbr: 'VT', pctDefault: 100, hoursPerJoint: 0.12, hoursPerMetre: 0.04, basis: 'ASME IX QW-194 / ISO 17637' },
  { id: 'pt', name: 'Penetrant testing', abbr: 'PT', pctDefault: 20, hoursPerJoint: 0.40, hoursPerMetre: 0.22, basis: 'ASME V Art.6 / ISO 3452' },
  { id: 'mt', name: 'Magnetic particle testing', abbr: 'MT', pctDefault: 20, hoursPerJoint: 0.50, hoursPerMetre: 0.28, basis: 'ASME V Art.7 / ISO 17638' },
  { id: 'rt', name: 'Radiographic testing', abbr: 'RT', pctDefault: 10, hoursPerJoint: 0.65, hoursPerMetre: 0.45, basis: 'ASME V Art.2 / ISO 17636' },
  { id: 'ut', name: 'Ultrasonic testing', abbr: 'UT', pctDefault: 20, hoursPerJoint: 1.10, hoursPerMetre: 0.75, basis: 'ASME V Art.4 / ISO 17640' },
  { id: 'paut', name: 'Phased array UT', abbr: 'PAUT', pctDefault: 10, hoursPerJoint: 1.60, hoursPerMetre: 1.00, basis: 'ASME V Art.4 / ISO 13588' },
  { id: 'pmi', name: 'PMI / hardness survey', abbr: 'PMI', pctDefault: 10, hoursPerJoint: 0.25, hoursPerMetre: 0.15, basis: 'ASME B31.3 331.1.3 / NACE MR0175' },
];

export type NdtBasis = 'auto' | 'linear' | 'joint';

/** Rule requested by the client: ≥ 1000 mm OD (or a straight/longitudinal weld) → per linear metre, < 1000 mm → per joint. */
export function resolveNdtBasis(basis: NdtBasis, od: number, isStraight: boolean): 'linear' | 'joint' {
  if (basis === 'linear') return 'linear';
  if (basis === 'joint') return 'joint';
  if (isStraight) return 'linear';
  return od >= 1000 ? 'linear' : 'joint';
}
