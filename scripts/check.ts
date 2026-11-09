// Numeric verification of the welding engine. Bundled with esbuild and run in node.
import { computeScenario, computeGeometry, computeNdt, makeScenario } from '../src/lib/calc';

const s1 = makeScenario({
  tag: 'T1', materialId: 'x65', processId: 'gmaw_spray', positionId: '5G', sizeIndex: 0,
  component: 'pipe', connectionId: 'pipe_pipe', nps: 24, schedule: '40',
  jointKind: 'singleV', thickness: 12.7, includedAngle: 60, rootGap: 2, land: 1.5,
  reinforcement: 2, rootPenetration: 1.5, lengthMode: 'circ', od: 610, joints: 40,
});
const s2 = makeScenario({
  tag: 'T2', materialId: 'a516_70', processId: 'saw', positionId: '1G', sizeIndex: 1,
  component: 'plate', connectionId: 'plate_flat',
  jointKind: 'doubleV', thickness: 25, includedAngle: 60, rootGap: 2, land: 2,
  reinforcement: 2, rootPenetration: 0, lengthMode: 'fixed', od: 0, lengthPerJoint: 6, joints: 4,
});
const s3 = makeScenario({
  tag: 'T3', materialId: 'a36', processId: 'fcaw_gs', positionId: '1G', sizeIndex: 1,
  component: 'plate', connectionId: 'plate_struct',
  jointKind: 'filletT2', leg: 10, convexity: 0.5, rootPenetration: 1,
  lengthMode: 'fixed', od: 0, lengthPerJoint: 12, joints: 8,
});
const s4 = makeScenario({
  tag: 'T4', materialId: 'ss316l', processId: 'gtaw', positionId: '6G', sizeIndex: 1,
  component: 'pipe', connectionId: 'pipe_pipe', nps: 8, schedule: 'STD',
  jointKind: 'singleU', thickness: 20, includedAngle: 20, rootGap: 2, land: 0, rootRadius: 6,
  reinforcement: 1, rootPenetration: 0, lengthMode: 'circ', od: 219.1, joints: 10,
});

function check(label: string, actual: number, expected: number, tolPct: number) {
  const ok = Math.abs(actual - expected) / expected <= tolPct / 100;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${actual.toFixed(3)}, expected ${expected.toFixed(3)}`);
  return ok;
}

let allOk = true;

// --- independent hand calculation: single V, t=12.7, gap 2, land 1.5, 60 deg, r=2, p=1.5
const d = 12.7 - 1.5;
const ta = Math.tan((60 / 2) * (Math.PI / 180));
const handArea = 2 * 12.7 + d * d * ta + (2 / 3) * (2 + 2 * d * ta) * 2 + (2 / 3) * 2 * 1.5;
allOk = check('Single V area (hand calc)', computeGeometry(s1).area, handArea, 0.01) && allOk;

// --- double V, t=25, gap 2, land 2, 60 deg, r=2
const d2 = 25 / 2 - 2;
const handDouble = 2 * 25 + 2 * d2 * d2 * ta + 2 * (2 / 3) * (2 + 2 * d2 * ta) * 2;
allOk = check('Double V area (hand calc)', computeGeometry(s2).area, handDouble, 0.01) && allOk;

// --- fillet, a=10 both sides, convexity .5, root pen 1
const handFillet = 10 * 10 + 2 * (2 / 3) * Math.SQRT2 * 10 * 0.5 + 2 * (2 / 3) * 10 * 1;
allOk = check('Double fillet area (hand calc)', computeGeometry(s3).area, handFillet, 0.01) && allOk;

const r1 = computeScenario(s1);
const r2 = computeScenario(s2);
const r3 = computeScenario(s3);
const r4 = computeScenario(s4);

// deposit = A * L(mm) * rho * 1e-9
allOk = check('T1 deposit mass', r1.deposit, (r1.geo.area * 40 * Math.PI * 610 * 7850) / 1e9, 0.01) && allOk;
allOk = check('T2 deposit mass', r2.deposit, (r2.geo.area * 24000 * 7850) / 1e9, 0.01) && allOk;

// hours = deposit / (rate*posFactor) / OF
allOk = check('T1 welding hours', r1.weldingHours, r1.deposit / (3.6 * 0.76) / 0.5, 0.01) && allOk;

// heat input
const k = 0.8;
allOk = check('T1 heat input', r1.heatInput, (k * 28 * 260 * 60) / (1000 * 350), 0.01) && allOk;

console.log('\n--- scenario outputs ---');
for (const r of [r1, r2, r3, r4]) {
  console.log(
    `${r.s.tag}  A=${r.geo.area.toFixed(1)} mm2  L=${r.totalLength.toFixed(2)} m  ` +
      `deposit=${r.deposit.toFixed(2)} kg  gross=${r.grossConsumable.toFixed(2)} kg  ` +
      `passes/jt=${r.passesPerJoint}  arc=${r.arcTime.toFixed(2)} h  total=${r.weldingHours.toFixed(2)} h  ` +
      `h/m=${r.hoursPerMetre.toFixed(3)}  HI=${r.heatInput.toFixed(2)}  NDT=${r.ndt.basis}/${r.ndt.metres.toFixed(2)} m/${r.ndt.joints.toFixed(1)} jt  ` +
      `films=${r.ndt.films}`,
  );
}

// NDT basis rule
allOk = check('T1 NDT basis joint (OD 610 < 1000)', r1.ndt.basis === 'joint' ? 1 : 0, 1, 0) && allOk;
allOk = check('T2 NDT basis linear (straight weld)', r2.ndt.basis === 'linear' ? 1 : 0, 1, 0) && allOk;
allOk = check('T3 NDT basis linear (structural)', r3.ndt.basis === 'linear' ? 1 : 0, 1, 0) && allOk;

// NDT per-joint: joints tested = ceil(pct*joints)
const n1 = computeNdt({ ...s1, ndtPct: { ...s1.ndtPct, rt: 10, vt: 100, pt: 0, mt: 0, ut: 0, paut: 0, pmi: 0 } }, r1.totalLength, 40, r1.lengthPerJoint);
allOk = check('T1 RT joints tested (10% of 40)', n1.lines.find((l) => l.method.id === 'rt')!.jointsTested, 4, 0) && allOk;

// large bore -> linear basis
const big = makeScenario({
  component: 'pipe', connectionId: 'pipe_pipe', nps: 48, schedule: 'STD',
  joints: 10, jointKind: 'doubleV', thickness: 20, materialId: 'x70', processId: 'saw',
});
const rb = computeScenario(big);
allOk = check('Large bore (1219.2 mm) NDT basis linear', rb.ndt.basis === 'linear' ? 1 : 0, 1, 0) && allOk;

// material density effect: stainless should be heavier than carbon for same area
const csSame = computeScenario(makeScenario({ materialId: 'a106b', component: 'plate', connectionId: 'plate_flat', jointKind: 'singleV', thickness: 20, lengthMode: 'fixed', od: 0, lengthPerJoint: 10, joints: 1 }));
const ssSame = computeScenario(makeScenario({ materialId: 'ss316l', component: 'plate', connectionId: 'plate_flat', jointKind: 'singleV', thickness: 20, lengthMode: 'fixed', od: 0, lengthPerJoint: 10, joints: 1 }));
allOk = check('316L denser than carbon steel', ssSame.deposit / csSame.deposit, 8000 / 7850, 0.5) && allOk;

// consumable efficiency
const smawScn = makeScenario({ processId: 'smaw', component: 'plate', connectionId: 'plate_flat' });
allOk = check('SMAW gross = deposit / 0.65', computeScenario(smawScn).grossConsumable, computeScenario(smawScn).deposit / 0.65, 0.01) && allOk;

console.log(`\nRESULT: ${allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
if (!allOk) process.exit(1);
