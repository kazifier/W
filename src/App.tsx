import { useEffect, useMemo, useState } from 'react';
import {
  computeScenario,
  computeTotals,
  makeScenario,
  resultsCsv,
  type Scenario,
} from './lib/calc';
import ScenariosPanel from './components/Scenarios';
import ResultsPanel from './components/Results';
import NdtPanel from './components/Ndt';
import SummaryPanel from './components/Summary';
import ReferencePanel from './components/Reference';
import { nf, num } from './lib/format';

export interface ProjectMeta {
  name: string;
  client: string;
  projectNo: string;
  docNo: string;
  revision: string;
  date: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  standard: string;
  notes: string;
}

type Tab = 'scenarios' | 'results' | 'ndt' | 'summary' | 'reference';

const STORAGE_KEY = 'weldcalc.sheet.v2';

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_PROJECT: ProjectMeta = {
  name: 'Pipeline, vessel & exchanger fabrication — welding works',
  client: '',
  projectNo: '',
  docNo: 'WC-001',
  revision: 'Rev A',
  date: today(),
  preparedBy: '',
  checkedBy: '',
  approvedBy: '',
  standard: 'ASME B31.3 / ASME IX / ASME VIII Div.1 / API 1104 / AWS D1.1',
  notes:
    'Consumable quantities are calculated from theoretical joint geometry. Add 5–15 % for fit-up variation, repair and rework before purchase.',
};

const ALL_NDT = { vt: 100, pt: 0, mt: 0, rt: 10, ut: 0, paut: 0, pmi: 0 };

function seedScenarios(): Scenario[] {
  return [
    // 1 — large bore line pipe
    makeScenario({
      tag: 'S-01',
      description: '24" mainline girth weld, X65 line pipe',
      wpsNo: 'WPS-PL-001',
      component: 'pipe',
      connectionId: 'pipe_pipe',
      nps: 24,
      schedule: '40',
      od: 610,
      thickness: 17.48,
      joints: 40,
      materialId: 'x65',
      processId: 'gmaw_spray',
      positionId: '5G',
      sizeIndex: 0,
      jointKind: 'singleV',
      includedAngle: 60,
      rootGap: 2,
      land: 1.5,
      reinforcement: 2,
      rootPenetration: 1.5,
      ndtPct: { ...ALL_NDT, rt: 10 },
    }),
    // 2 — small bore spool to fitting
    makeScenario({
      tag: 'S-02',
      description: '8" Sch 40 pipe to elbow, shop spool',
      wpsNo: 'WPS-CS-004',
      component: 'pipe',
      connectionId: 'pipe_fitting',
      nps: 8,
      schedule: '40',
      od: 219.1,
      thickness: 8.18,
      joints: 30,
      materialId: 'a106b',
      processId: 'smaw',
      positionId: '6G',
      sizeIndex: 1,
      jointKind: 'singleV',
      includedAngle: 60,
      rootGap: 2,
      land: 1.5,
      reinforcement: 1.5,
      rootPenetration: 1,
      ndtPct: { ...ALL_NDT, rt: 10 },
    }),
    // 3 — plate: shell longitudinal seam
    makeScenario({
      tag: 'S-03',
      description: 'Vessel shell longitudinal seam, SAW',
      wpsNo: 'WPS-PV-011',
      component: 'plate',
      connectionId: 'plate_long',
      od: 0,
      thickness: 25,
      joints: 4,
      lengthMode: 'fixed',
      lengthPerJoint: 6,
      materialId: 'a516_70',
      processId: 'saw',
      positionId: '1G',
      sizeIndex: 1,
      jointKind: 'doubleV',
      includedAngle: 60,
      rootGap: 2,
      land: 2,
      reinforcement: 2,
      rootPenetration: 0,
      ndtPct: { ...ALL_NDT, rt: 10, ut: 20 },
    }),
    // 4 — plate: shell to dished end
    makeScenario({
      tag: 'S-04',
      description: 'Shell to 2:1 ellipsoidal head, Ø2000 mm',
      wpsNo: 'WPS-PV-012',
      component: 'plate',
      connectionId: 'plate_shell_dish',
      od: 2000,
      thickness: 20,
      joints: 1,
      materialId: 'a516_70',
      processId: 'smaw',
      positionId: '2G',
      sizeIndex: 2,
      jointKind: 'singleV',
      includedAngle: 60,
      rootGap: 2,
      land: 1.5,
      reinforcement: 2,
      rootPenetration: 1.5,
      ndtPct: { ...ALL_NDT, rt: 10, pt: 10 },
    }),
    // 5 — tube to tubesheet
    makeScenario({
      tag: 'S-05',
      description: 'Tube to tubesheet strength weld — 900 tubes',
      wpsNo: 'WPS-HX-003',
      component: 'tube',
      connectionId: 'tube_ts_strength',
      tubeOd: 25.4,
      tubeWall: 2.11,
      tubeCount: 900,
      tubesheet: 60,
      od: 25.4,
      thickness: 2.11,
      joints: 900,
      materialId: 'ss316l',
      processId: 'gtaw',
      positionId: '1G',
      sizeIndex: 1,
      jointKind: 'filletT1',
      leg: 3.2,
      convexity: 0.3,
      rootPenetration: 0,
      ndtPct: { ...ALL_NDT, rt: 0, pt: 10 },
    }),
    // 6 — dissimilar metal joint
    makeScenario({
      tag: 'S-06',
      description: '12" carbon steel to 316L stainless, dissimilar',
      wpsNo: 'WPS-DM-001',
      component: 'pipe',
      connectionId: 'pipe_pipe',
      nps: 12,
      schedule: '40',
      od: 323.8,
      thickness: 10.31,
      joints: 12,
      materialId: 'a106b',
      materialId2: 'ss316l',
      processId: 'smaw',
      positionId: '6G',
      sizeIndex: 1,
      jointKind: 'singleV',
      includedAngle: 60,
      rootGap: 2,
      land: 1.5,
      reinforcement: 1.5,
      rootPenetration: 1,
      ndtPct: { ...ALL_NDT, rt: 10, pt: 10, pmi: 10 },
    }),
    // 7 — structural fillet
    makeScenario({
      tag: 'S-07',
      description: 'Stiffener to shell, double fillet 10 mm',
      wpsNo: 'WPS-ST-002',
      component: 'plate',
      connectionId: 'plate_struct',
      od: 0,
      thickness: 12,
      joints: 8,
      lengthMode: 'fixed',
      lengthPerJoint: 12,
      materialId: 'a36',
      processId: 'fcaw_gs',
      positionId: '1G',
      sizeIndex: 1,
      jointKind: 'filletT2',
      leg: 10,
      convexity: 0.5,
      rootPenetration: 1,
      ndtPct: { ...ALL_NDT, rt: 0, mt: 20 },
    }),
  ];
}

function loadState(): { project: ProjectMeta; scenarios: Scenario[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.scenarios)) return null;
    return { project: { ...DEFAULT_PROJECT, ...parsed.project }, scenarios: parsed.scenarios };
  } catch {
    return null;
  }
}

export default function App() {
  const saved = useMemo(loadState, []);
  const [project, setProject] = useState<ProjectMeta>(saved?.project ?? DEFAULT_PROJECT);
  const [scenarios, setScenarios] = useState<Scenario[]>(saved?.scenarios ?? seedScenarios());
  const [tab, setTab] = useState<Tab>('scenarios');

  const results = useMemo(() => scenarios.map(computeScenario), [scenarios]);
  const totals = useMemo(() => computeTotals(results), [results]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ project, scenarios }));
    } catch {
      /* storage full or blocked — not fatal */
    }
  }, [project, scenarios]);

  const exportCsv = () => {
    const blob = new Blob([resultsCsv(results)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.docNo || 'weldcalc'}-${project.revision.replace(/\s+/g, '') || 'revA'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ project, scenarios }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.docNo || 'weldcalc'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.project) setProject({ ...DEFAULT_PROJECT, ...parsed.project });
        if (Array.isArray(parsed.scenarios)) setScenarios(parsed.scenarios);
        setTab('scenarios');
      } catch {
        alert('That file could not be read as a WeldCalc project.');
      }
    };
    reader.readAsText(file);
  };

  const reset = () => {
    if (!confirm('Load the example project and discard the current sheet?')) return;
    setProject(DEFAULT_PROJECT);
    setScenarios(seedScenarios());
    setTab('scenarios');
  };

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: 'scenarios', label: 'Scenarios', badge: String(scenarios.length) },
    { id: 'results', label: 'Results' },
    { id: 'ndt', label: 'NDT plan' },
    { id: 'summary', label: 'Summary sheet' },
    { id: 'reference', label: 'Reference' },
  ];

  return (
    <div className="app">
      <header className="app-head no-print">
        <div className="brand">
          <div className="logo">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-text">
            <strong>WeldCalc</strong>
            <input
              className="head-input"
              value={project.name}
              placeholder="Project name"
              onChange={(e) => setProject({ ...project, name: e.target.value })}
            />
          </div>
        </div>

        <nav className="tabs">
          {tabs.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'tab-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.badge && <em className="tab-badge">{t.badge}</em>}
            </button>
          ))}
        </nav>

        <div className="actions">
          <button className="btn btn-ghost" onClick={exportCsv}>CSV</button>
          <button className="btn btn-ghost" onClick={exportJson}>Save</button>
          <label className="btn btn-ghost">
            Load
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = '';
              }}
            />
          </label>
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Print sheet</button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'scenarios' && <ScenariosPanel scenarios={scenarios} onChange={setScenarios} />}
        {tab === 'results' && <ResultsPanel results={results} totals={totals} />}
        {tab === 'ndt' && <NdtPanel results={results} totals={totals} />}
        {tab === 'summary' && (
          <SummaryPanel project={project} setProject={setProject} results={results} totals={totals} />
        )}
        {tab === 'reference' && <ReferencePanel />}
      </main>

      <footer className="totals-bar">
        <div className="tb-item"><span>Total length</span><b>{num(totals.length, 1)} m</b></div>
        <div className="tb-item"><span>Joints</span><b>{totals.joints}</b></div>
        <div className="tb-item"><span>Weld volume</span><b>{nf(totals.volume / 1e6, 2)} dm³</b></div>
        <div className="tb-item"><span>Deposit weight</span><b>{num(totals.deposit, 1)} kg</b></div>
        <div className="tb-item"><span>Gross consumable</span><b>{num(totals.grossConsumable, 1)} kg</b></div>
        <div className="tb-item"><span>Welding hours</span><b>{num(totals.weldingHours, 1)} h</b></div>
        <div className="tb-item"><span>NDT hours</span><b>{num(totals.ndtHours, 1)} h</b></div>
        <div className="tb-item tb-note">Auto-saved in this browser</div>
      </footer>
    </div>
  );
}
