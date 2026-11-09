import { NDT_METHODS } from '../lib/data';
import type { ScenarioResult, Totals } from '../lib/calc';
import { nf, num } from '../lib/format';
import { Card, Pill, Stat } from './ui';

export default function NdtPanel({ results, totals }: { results: ScenarioResult[]; totals: Totals }) {
  return (
    <div className="stack">
      <Card
        title="NDT plan — scope basis"
        subtitle="Large-diameter and linear welds are sampled on a linear-metre basis; welds on pipe below 1 m outside diameter are sampled per joint."
        right={<Pill tone="info">auto rule: OD ≥ 1000 mm → per metre</Pill>}
      >
        <div className="rule-band">
          <div className="rule-item">
            <span className="rule-key">Linear-metre basis</span>
            <span className="rule-val">OD ≥ 1000 mm, or any straight / longitudinal / structural weld</span>
          </div>
          <div className="rule-item">
            <span className="rule-key">Per-joint basis</span>
            <span className="rule-val">OD &lt; 1000 mm (small-bore pipe, tube-to-tubesheet)</span>
          </div>
          <div className="rule-item">
            <span className="rule-key">Quantity tested</span>
            <span className="rule-val">Linear: % × total length &nbsp;·&nbsp; Joint: ⌈% × joint count⌉</span>
          </div>
          <div className="rule-item">
            <span className="rule-key">RT film count</span>
            <span className="rule-val">⌈length ÷ 0.30 m effective film⌉; small bore min. 3 exposures per joint</span>
          </div>
        </div>
      </Card>

      {results.map((r) => (
        <Card
          key={r.s.id}
          title={`${r.s.tag} — ${r.s.description}`}
          subtitle={`${r.connection.label} · ${r.material.name}${r.material2 ? ` → ${r.material2.name}` : ''} · ${r.jt.label} · t = ${num(r.s.thickness, 1)} mm · ${num(r.totalLength, 2)} m over ${r.joints} joints`}
          right={<Pill tone={r.ndt.basis === 'linear' ? 'info' : 'default'}>{r.ndt.basis === 'linear' ? 'linear-metre basis' : 'per-joint basis'}</Pill>}
        >
          <div className="ndt-body">
            <table className="grid-table compact">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Standard basis</th>
                  <th className="r">Sample %</th>
                  <th className="r">{r.ndt.basis === 'linear' ? 'Metres tested' : 'Joints tested'}</th>
                  <th className="r">Equivalent metres</th>
                  <th className="r">Equivalent joints</th>
                  <th className="r">RT films</th>
                  <th className="r">Inspector hours</th>
                </tr>
              </thead>
              <tbody>
                {r.ndt.lines.map((l) => (
                  <tr key={l.method.id}>
                    <td>
                      <b>{l.method.abbr}</b> <span className="cell-sub-inline">{l.method.name}</span>
                    </td>
                    <td className="cell-note">{l.method.basis}</td>
                    <td className="r">{l.pct} %</td>
                    <td className="r strong">{r.ndt.basis === 'linear' ? `${num(l.metres, 2)} m` : `${l.jointsTested} jt`}</td>
                    <td className="r">{num(l.metres, 2)} m</td>
                    <td className="r">{num(l.jointsTested, 1)}</td>
                    <td className="r">{l.films || '—'}</td>
                    <td className="r">{num(l.hours, 2)}</td>
                  </tr>
                ))}
                {r.ndt.lines.length === 0 && (
                  <tr><td colSpan={8} className="empty">No NDT methods selected — set the sampling percentages on the Scenarios tab.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total — sum over {r.ndt.lines.length} methods</td>
                  <td className="r">{r.ndt.basis === 'linear' ? `${num(r.ndt.metres, 2)} m Σ` : `${num(r.ndt.joints, 1)} jt Σ`}</td>
                  <td className="r cell-note">{num(r.ndt.metres, 2)} Σ</td>
                  <td className="r cell-note">{num(r.ndt.joints, 1)} Σ</td>
                  <td className="r">{r.ndt.films || '—'}</td>
                  <td className="r strong">{num(r.ndt.hours, 2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="ndt-bar">
              {NDT_METHODS.filter((m) => (r.s.ndtPct[m.id] ?? 0) > 0).map((m) => {
                const p = r.s.ndtPct[m.id];
                return (
                  <div className="bar-row" key={m.id}>
                    <span className="bar-label">{m.abbr}</span>
                    <span className="bar-track"><span className="bar-fill" style={{ width: `${Math.min(100, p)}%` }} /></span>
                    <span className="bar-val">{p} %</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}

      <Card title="NDT roll-up" subtitle="Campaign totals and inspector resource requirement.">
        <div className="kpi-strip">
          <Stat label="Total weld length" value={num(totals.length, 1)} unit="m" />
          <Stat label="Total joints" value={totals.joints} />
          <Stat label="NDT metres (Σ methods)" value={num(totals.ndtMetres, 1)} unit="m" />
          <Stat label="NDT joints (Σ methods)" value={num(totals.ndtJoints, 0)} />
          <Stat label="Radiographs" value={totals.films} unit="films" />
          <Stat label="Inspector hours" value={num(totals.ndtHours, 1)} unit="h" />
          <Stat label="Inspector days @8 h" value={num(totals.ndtHours / 8, 1)} unit="d" />
        </div>

        <table className="grid-table compact mt">
          <thead>
            <tr>
              <th>Method</th>
              <th className="r">Metres tested</th>
              <th className="r">Joints tested</th>
              <th className="r">Films</th>
              <th className="r">Hours</th>
            </tr>
          </thead>
          <tbody>
            {NDT_METHODS.map((m) => {
              const metres = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.metres ?? 0), 0);
              const joints = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.jointsTested ?? 0), 0);
              const films = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.films ?? 0), 0);
              const hours = results.reduce((a, r) => a + (r.ndt.lines.find((l) => l.method.id === m.id)?.hours ?? 0), 0);
              if (hours === 0) return null;
              return (
                <tr key={m.id}>
                  <td><b>{m.abbr}</b> <span className="cell-sub-inline">{m.name}</span></td>
                  <td className="r">{num(metres, 2)}</td>
                  <td className="r">{num(joints, 1)}</td>
                  <td className="r">{films || '—'}</td>
                  <td className="r strong">{num(hours, 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="note">
          Percentages are project/WPS sampling rates applied after the 100 % visual examination. Where RT and UT are both specified
          on the same weld by a contract (e.g. ASME B31.3 normal service: 5 % RT, or 5 % RT + 5 % UT in lieu of 10 % RT), enter the
          agreed split here. Radiograph counts assume 300 mm film with 20 % overlap and a single-wall technique for OD ≥ 100 mm;
          small-bore and tube welds assume double-wall single-image with a minimum of 3 exposures per joint.
        </p>
      </Card>
    </div>
  );
}
