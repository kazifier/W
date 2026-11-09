// Verification for the component / connection / dissimilar-metal features.
import { applyComponent, applyComponentSize, applyConnection, computeScenario, makeScenario } from '../src/lib/calc';
import { idFor, schedulesFor, wallFor } from '../src/lib/pipes';

let allOk = true;
function check(label: string, actual: number, expected: number, tolPct = 0) {
  const ok =
    tolPct === 0
      ? Math.abs(actual - expected) < 1e-9
      : Math.abs(actual - expected) / Math.max(expected, 1e-9) <= tolPct / 100;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${actual}, expected ${expected}`);
  return ok;
}
function checkBool(label: string, cond: boolean) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  return cond;
}

// --- pipe schedule table ---------------------------------------------------
allOk = check('24" Sch 40 wall', wallFor(24, '40'), 17.48) && allOk;
allOk = check('8" Sch 40 wall', wallFor(8, '40'), 8.18) && allOk;
allOk = check('24" Sch STD wall', wallFor(24, 'STD'), 9.53) && allOk;
allOk = check('24" Sch 40 inside diameter', idFor(24, '40'), 610 - 2 * 17.48) && allOk;
allOk = checkBool('24" has Sch 40 / STD / 80 / XS', ['40', 'STD', '80', 'XS'].every((s) => schedulesFor(24).includes(s)));
allOk = checkBool('12" has both 10S and STD', schedulesFor(12).includes('10S') && schedulesFor(12).includes('STD'));

// --- connection presets ----------------------------------------------------
const base = makeScenario({});
const flange = applyConnection(base, 'pipe_flange');
allOk = checkBool('pipe_flange sets single V', flange.jointKind === 'singleV');
allOk = check('pipe_flange sets PT 10%', flange.ndtPct.pt, 10);
allOk = check('pipe_flange sets RT 0%', flange.ndtPct.rt, 0);

const tubeScn = applyComponent(base, 'tube');
allOk = checkBool('component tube switches connection', tubeScn.component === 'tube' && tubeScn.connectionId === 'tube_ts_strength');
allOk = check('tube od follows tubeOd', tubeScn.od, tubeScn.tubeOd);
allOk = check('tube joints follow tubeCount', tubeScn.joints, tubeScn.tubeCount);

// --- pipe sizing drives geometry -------------------------------------------
const pipeScn = applyComponentSize({ ...base, connectionId: 'pipe_pipe', nps: 24, schedule: '40' });
allOk = check('pipe scenario OD from NPS', pipeScn.od, 610);
allOk = check('pipe scenario wall from schedule', pipeScn.thickness, 17.48);

const rp = computeScenario(pipeScn);
allOk = check('pipe weld length per joint = pi x OD', rp.lengthPerJoint, (Math.PI * 610) / 1000, 0.001);
// 24" = 610 mm, i.e. below the 1 m threshold -> per joint, as the rule requires.
allOk = checkBool('24" (610 mm) resolves to per-joint NDT basis', rp.ndt.basis === 'joint');

const bigBore = computeScenario(applyComponentSize({ ...base, connectionId: 'pipe_pipe', nps: 42, schedule: '40' }));
allOk = check('42" OD', bigBore.lengthPerJoint, (Math.PI * 1066.8) / 1000, 0.001);
allOk = checkBool('42" (1066.8 mm) resolves to linear-metre NDT basis', bigBore.ndt.basis === 'linear');

// --- tube to tubesheet -----------------------------------------------------
const rt = computeScenario(
  makeScenario({
    component: 'tube', connectionId: 'tube_ts_strength',
    tubeOd: 25.4, tubeWall: 2.11, tubeCount: 900, od: 25.4, thickness: 2.11, joints: 900,
    jointKind: 'filletT1', leg: 3.2, materialId: 'ss316l', processId: 'gtaw',
    ndtPct: { vt: 100, pt: 10, mt: 0, rt: 0, ut: 0, paut: 0, pmi: 0 },
  }),
);
allOk = check('tube weld length = pi x 25.4 mm', rt.lengthPerJoint, (Math.PI * 25.4) / 1000, 0.001);
allOk = checkBool('tube (<1000 mm) resolves to per-joint NDT basis', rt.ndt.basis === 'joint');
allOk = check('900 tubes total length', rt.totalLength, 900 * ((Math.PI * 25.4) / 1000), 0.001);
allOk = check('900 tubes PT 10% -> 90 joints', rt.ndt.lines.find((l) => l.method.id === 'pt')!.jointsTested, 90);
allOk = checkBool('tube fillet uses leg, not wall thickness', rt.geo.area > 5 && rt.geo.area < 15);

// --- plate connections -----------------------------------------------------
const shellDish = computeScenario(
  makeScenario({ component: 'plate', connectionId: 'plate_shell_dish', od: 2000, thickness: 20, joints: 1, materialId: 'a516_70', processId: 'smaw', jointKind: 'singleV' }),
);
allOk = check('shell-to-head joint length = pi x 2000', shellDish.lengthPerJoint, (Math.PI * 2000) / 1000, 0.001);
allOk = checkBool('2000 mm shell resolves to linear NDT basis', shellDish.ndt.basis === 'linear');

const longSeam = computeScenario(
  makeScenario({ component: 'plate', connectionId: 'plate_long', thickness: 25, lengthMode: 'fixed', lengthPerJoint: 6, joints: 4, materialId: 'a516_70', processId: 'saw', jointKind: 'doubleV' }),
);
allOk = check('long seam total length', longSeam.totalLength, 24);
allOk = checkBool('straight long seam resolves to linear basis', longSeam.ndt.basis === 'linear');

// --- nozzle to shell (plate component, NPS sized) --------------------------
const nozzle = applyComponentSize({ ...base, component: 'plate', connectionId: 'plate_nozzle', nps: 10, schedule: '40' });
allOk = check('nozzle-to-shell OD from NPS 10"', nozzle.od, 273.0);
allOk = check('nozzle-to-shell wall from schedule', nozzle.thickness, 9.27);

// --- dissimilar metals -----------------------------------------------------
const diss = computeScenario(
  makeScenario({ component: 'pipe', connectionId: 'pipe_pipe', nps: 12, schedule: '40', od: 323.8, thickness: 10.31, joints: 1, materialId: 'a106b', materialId2: 'ss316l', processId: 'smaw', jointKind: 'singleV' }),
);
allOk = checkBool('dissimilar filler is 309L', (diss.fillerLabel || '').includes('309L'));
allOk = check('dissimilar weld-metal density from filler', diss.density, 7900);
allOk = check('dissimilar deposit uses filler density', diss.deposit, (diss.volume * 7900) / 1e9, 0.001);
allOk = check('dissimilar HI limit is the lower of the two', diss.hiLimit, 15);
allOk = checkBool('dissimilar preheat governed by the ferritic side', diss.preheatMin === 10);

const same = computeScenario(makeScenario({ materialId: 'a106b', materialId2: null }));
allOk = checkBool('no second metal means no dissimilar block', same.dissimilar === null);
allOk = check('matching filler comes from base metal', same.density, 7850);

const ally = computeScenario(makeScenario({ materialId: 'a106b', materialId2: 'al5083' }));
allOk = checkBool('steel + aluminium flagged as incompatible', ally.dissimilar !== null && !ally.dissimilar.compatible);

console.log(`\nRESULT: ${allOk ? 'ALL FEATURE CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
if (!allOk) process.exit(1);
