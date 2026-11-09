import type { ProjectMeta } from '../App';
import type { ScenarioResult, Totals } from '../lib/calc';
import { nf, num } from '../lib/format';
import { Card, Field } from './ui';
import { NDT_METHODS } from '../lib/data';

interface Props {
  project: ProjectMeta;
  setProject: (p: ProjectMeta) => void;
  results: ScenarioResult[];
  totals: Totals;
}

export default function SummaryPanel({ project, setProject, results, totals }: Props) {
  const set = (k: keyof ProjectMeta) => (v: string) => setProject({ ...project, [k]: v });

  // BOM grouped by process + filler
  const bom = new Map<string, { process: string; filler: string; deposit: number; gross: number; wire: number; rods: number; flux: number; gas: number }>();
  for (const r of results) {
    const key = `${r.process.id}|${r.fillerLabel}`;
    const row = bom.get(key) ?? { process: r.process.abbr, filler: r.fillerLabel, deposit: 0, gross: 0, wire: 0, rods: 0, flux: 0, gas: 0 };
    row.deposit += r.deposit;
    row.gross += r.grossConsumable;
    row.wire += r.wireLength ?? 0;
    row.rods += r.electrodeCount ?? 0;
    row.flux += r.flux ?? 0;
    row.gas += r.gas ?? 0;
    bom.set(key, row);
  }

  const hoursByProcess = new Map<string, { abbr: string; hours: number; deposit: number }>();
  for (const r of results) {
    const row = hoursByProcess.get(r.process.id) ?? { abbr: r.process.abbr, hours: 0, deposit: 0 };
    row.hours += r.weldingHours;
    row.deposit += r.deposit;
    hoursByProcess.set(r.process.id, row);
  }
  const maxHours = Math.max(1, ...Array.from(hoursByProcess.values()).map((v) => v.hours));

  return (
    <div className="stack print-root">
      <div className="sheet-head no-print-edit">
        <div className="sheet-title-block">
          <p className="eyebrow">Welding calculation sheet</p>
          <h1>{project.name || 'Untitled project'}</h1>
          <p className="sub">{project.client || 'Client not set'} · {project.projectNo || 'Project no. not set'}</p>
        </div>
        <div className="doc-control">
          <table className="mini-table">
            <tbody>
              <tr><td>Document</td><td className="r"><input className="inline-input" value={project.docNo} onChange={(e) => set('docNo')(e.target.value)} /></td></tr>
              <tr><td>Revision</td><td className="r"><input className="inline-input" value={project.revision} onChange={(e) => set('revision')(e.target.value)} /></td></tr>
              <tr><td>Date</td><td className="r"><input className="inline-input" type="date" value={project.date} onChange={(e) => set('date')(e.target.value)} /></td></tr>
              <tr><td>Code basis</td><td className="r"><input className="inline-input" value={project.standard} onChange={(e) => set('standard')(e.target.value)} /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <Card title="Document control" subtitle="Editable header fields — these appear on the printed sheet.">
        <div className="grid-3">
          <Field label="Project name"><input className="input" value={project.name} onChange={(e) => set('name')(e.target.value)} /></Field>
          <Field label="Client / owner"><input className="input" value={project.client} onChange={(e) => set('client')(e.target.value)} /></Field>
          <Field label="Project number"><input className="input" value={project.projectNo} onChange={(e) => set('projectNo')(e.target.value)} /></Field>
          <Field label="Document number"><input className="input" value={project.docNo} onChange={(e) => set('docNo')(e.target.value)} /></Field>
          <Field label="Revision"><input className="input" value={project.revision} onChange={(e) => set('revision')(e.target.value)} /></Field>
          <Field label="Date"><input className="input" type="date" value={project.date} onChange={(e) => set('date')(e.target.value)} /></Field>
          <Field label="Prepared by"><input className="input" value={project.preparedBy} onChange={(e) => set('preparedBy')(e.target.value)} /></Field>
          <Field label="Checked by"><input className="input" value={project.checkedBy} onChange={(e) => set('checkedBy')(e.target.value)} /></Field>
          <Field label="Approved by"><input className="input" value={project.approvedBy} onChange={(e) => set('approvedBy')(e.target.value)} /></Field>
        </div>
        <Field label="Design / fabrication code basis">
          <input className="input" value={project.standard} onChange={(e) => set('standard')(e.target.value)} />
        </Field>
        <Field label="Notes / assumptions">
          <textarea className="input textarea" rows={3} value={project.notes} onChange={(e) => set('notes')(e.target.value)} />
        </Field>
      </Card>

      <Card title="1 — Scope of welding" subtitle="Summary of the weld scenarios carried in this sheet.">
        <div className="table-scroll">
          <table className="grid-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Description</th>
                <th>WPS</th>
                <th>Material</th>
                <th>Connection</th>
                <th>Joint</th>
                <th className="r">t (mm)</th>
                <th>Process</th>
                <th className="r">Joints</th>
                <th className="r">Length (m)</th>
                <th className="r">Deposit (kg)</th>
                <th className="r">Hours (h)</th>
                <th>NDT basis</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.s.id}>
                  <td><b>{r.s.tag}</b></td>
                  <td className="cell-note">{r.s.description}</td>
                  <td>{r.s.wpsNo}</td>
                  <td>{r.material.name}{r.material2 ? ` → ${r.material2.name}` : ''}</td>
                  <td className="cell-note">{r.connection.label}</td>
                  <td>{r.jt.short}</td>
                  <td className="r">{num(r.s.thickness, 1)}</td>
                  <td>{r.process.abbr}</td>
                  <td className="r">{r.joints}</td>
                  <td className="r">{num(r.totalLength, 2)}</td>
                  <td className="r">{num(r.deposit, 2)}</td>
                  <td className="r">{num(r.weldingHours, 2)}</td>
                  <td className="cell-note">{r.ndt.basis === 'linear' ? 'linear m' : 'per joint'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={8}>Total</td>
                <td className="r">{totals.joints}</td>
                <td className="r">{num(totals.length, 2)}</td>
                <td className="r">{num(totals.deposit, 2)}</td>
                <td className="r">{num(totals.weldingHours, 2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Card title="2 — Consumable requirement (bill of materials)" subtitle="Deposit weight is net weld metal; gross is what must be purchased and issued to the welders.">
        <div className="table-scroll">
          <table className="grid-table">
            <thead>
              <tr>
                <th>Process / filler</th>
                <th className="r">Deposit (kg)</th>
                <th className="r">Gross consumable (kg)</th>
                <th className="r">Wire / rod (m)</th>
                <th className="r">Electrodes (pcs)</th>
                <th className="r">Flux (kg)</th>
                <th className="r">Shielding gas (m³)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(bom.values()).map((b) => (
                <tr key={b.process}>
                  <td><b>{b.process}</b><span className="cell-sub">{b.filler}</span></td>
                  <td className="r">{num(b.deposit, 2)}</td>
                  <td className="r">{num(b.gross, 2)}</td>
                  <td className="r">{b.wire > 0 ? nf(b.wire, 0) : '—'}</td>
                  <td className="r">{b.rods > 0 ? nf(b.rods, 0) : '—'}</td>
                  <td className="r">{b.flux > 0 ? num(b.flux, 1) : '—'}</td>
                  <td className="r">{b.gas > 0 ? num(b.gas, 1) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td className="r">{num(totals.deposit, 2)}</td>
                <td className="r">{num(totals.grossConsumable, 2)}</td>
                <td className="r">{nf(totals.wireLength, 0)}</td>
                <td className="r">{nf(totals.electrodeCount, 0)}</td>
                <td className="r">{num(totals.flux, 1)}</td>
                <td className="r">{num(totals.gas, 1)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="note">
          Gross consumable = deposit ÷ deposition efficiency, which already covers electrode stubs, spatter and wire tip loss.
          Add a further 3–5 % for handling/waste when raising the purchase requisition.
        </p>
      </Card>

      <div className="two-col">
        <Card title="3 — Welding hours by process" subtitle="Paid welder hours after applying the operating factor.">
          <div className="bar-chart">
            {Array.from(hoursByProcess.values()).map((h) => (
              <div className="bar-row" key={h.abbr}>
                <span className="bar-label">{h.abbr}</span>
                <span className="bar-track"><span className="bar-fill accent" style={{ width: `${(h.hours / maxHours) * 100}%` }} /></span>
                <span className="bar-val">{num(h.hours, 1)} h</span>
              </div>
            ))}
          </div>
          <table className="mini-table mt">
            <tbody>
              <tr><td>Arc time (arc-on)</td><td className="r">{num(totals.arcTime, 1)} h</td></tr>
              <tr><td>Total welder hours</td><td className="r"><b>{num(totals.weldingHours, 1)} h</b></td></tr>
              <tr><td>Man-days at 8 h</td><td className="r">{num(totals.weldingHours / 8, 1)} d</td></tr>
              <tr><td>Crew of 4, single shift</td><td className="r">{num(totals.weldingHours / 32, 1)} d</td></tr>
              <tr><td>Total passes</td><td className="r">{totals.passes}</td></tr>
              <tr><td>Average deposit rate</td><td className="r">{totals.arcTime > 0 ? num(totals.deposit / totals.arcTime, 2) : '—'} kg/h</td></tr>
            </tbody>
          </table>
        </Card>

        <Card title="4 — NDT summary" subtitle="Examination quantities derived from the two sampling bases.">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>Method</th>
                <th className="r">Metres</th>
                <th className="r">Joints</th>
                <th className="r">Films</th>
                <th className="r">Hours</th>
              </tr>
            </thead>
            <tbody>
              {NDT_METHODS.map((m) => {
                const hours = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.hours ?? 0), 0);
                if (hours === 0) return null;
                const metres = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.metres ?? 0), 0);
                const joints = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.jointsTested ?? 0), 0);
                const films = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.films ?? 0), 0);
                return (
                  <tr key={m.id}>
                    <td><b>{m.abbr}</b></td>
                    <td className="r">{num(metres, 1)}</td>
                    <td className="r">{num(joints, 1)}</td>
                    <td className="r">{films || '—'}</td>
                    <td className="r">{num(hours, 1)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td className="r">{num(totals.ndtMetres, 1)}</td>
                <td className="r">{num(totals.ndtJoints, 1)}</td>
                <td className="r">{totals.films}</td>
                <td className="r">{num(totals.ndtHours, 1)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="note">
            Inspector hours are examination time only. Add travel, film processing/interpretation, report writing and
            client witness time as project allowances.
          </p>
        </Card>
      </div>

      <Card title="5 — Sign-off" subtitle="This sheet is a planning calculation, not a substitute for a qualified WPS/PQR.">
        <div className="signoff">
          <div className="sign"><span>Prepared</span><input className="input" value={project.preparedBy} onChange={(e) => set('preparedBy')(e.target.value)} /><em>Signature / date</em></div>
          <div className="sign"><span>Checked</span><input className="input" value={project.checkedBy} onChange={(e) => set('checkedBy')(e.target.value)} /><em>Signature / date</em></div>
          <div className="sign"><span>Approved</span><input className="input" value={project.approvedBy} onChange={(e) => set('approvedBy')(e.target.value)} /><em>Signature / date</em></div>
        </div>
        <p className="note">
          All consumable weights are calculated from the theoretical joint cross-section plus cap reinforcement and root
          penetration. Actual site consumption typically runs 5–15 % higher because of fit-up variation, repair and rework.
        </p>
      </Card>
    </div>
  );
}
