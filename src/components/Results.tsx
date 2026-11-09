import type { ScenarioResult, Totals } from '../lib/calc';
import { nf, num } from '../lib/format';
import { Card, Pill } from './ui';

export default function ResultsPanel({ results, totals }: { results: ScenarioResult[]; totals: Totals }) {
  return (
    <div className="stack">
      <Card
        title="Calculation results"
        subtitle="Full calculation output for every scenario. All weights are weld-metal deposit (not gross consumable) unless labelled otherwise."
        right={<Pill tone="info">{results.length} scenarios</Pill>}
      >
        <div className="table-scroll">
          <table className="grid-table">
            <thead>
              <tr className="grp">
                <th colSpan={7}>Weld</th>
                <th colSpan={3}>Geometry</th>
                <th colSpan={3}>Extent</th>
                <th colSpan={5}>Deposit &amp; consumables</th>
                <th colSpan={7}>Time &amp; thermal</th>
                <th colSpan={5}>NDT</th>
              </tr>
              <tr>
                <th className="sticky-l">Tag</th>
                <th>Connection</th>
                <th>Material</th>
                <th>Filler</th>
                <th>Process</th>
                <th>Pos.</th>
                <th>Joint</th>

                <th className="r">t (mm)</th>
                <th className="r">A (mm²)</th>
                <th className="r">Pass/jt</th>

                <th className="r">L/jt (m)</th>
                <th className="r">Joints</th>
                <th className="r">Total L (m)</th>

                <th className="r">Volume (cm³)</th>
                <th className="r">Deposit (kg)</th>
                <th className="r">kg/m</th>
                <th className="r">Gross cons. (kg)</th>
                <th>Consumable</th>

                <th className="r">Arc rate (kg/h)</th>
                <th className="r">Arc time (h)</th>
                <th className="r">OF</th>
                <th className="r">Weld h</th>
                <th className="r">h/m</th>
                <th className="r">h/jt</th>
                <th className="r">HI (kJ/mm)</th>

                <th>Basis</th>
                <th className="r">NDT (m)</th>
                <th className="r">NDT (jt)</th>
                <th className="r">Films</th>
                <th className="r">NDT h</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.s.id}>
                  <td className="sticky-l">
                    <b>{r.s.tag}</b>
                    <span className="cell-sub" title={r.s.description}>{r.s.description}</span>
                  </td>
                  <td>
                    {r.connection.label}
                    <span className="cell-sub">{r.connection.component}</span>
                  </td>
                  <td>
                    {r.material.name}
                    {r.material2 && <span className="cell-sub">→ {r.material2.name}</span>}
                  </td>
                  <td className={r.dissimilar ? 'cell-note' : ''}>
                    {r.dissimilar ? <Pill tone="warn">{r.fillerLabel}</Pill> : r.fillerLabel}
                  </td>
                  <td>{r.process.abbr}</td>
                  <td>{r.position.id}</td>
                  <td>{r.jt.short}</td>

                  <td className="r">{num(r.s.thickness, 1)}</td>
                  <td className="r">{num(r.geo.area, 1)}</td>
                  <td className="r">{r.passesPerJoint}</td>

                  <td className="r">{num(r.lengthPerJoint, 3)}</td>
                  <td className="r">{r.joints}</td>
                  <td className="r">{num(r.totalLength, 2)}</td>

                  <td className="r">{nf(r.volume / 1000, 0)}</td>
                  <td className="r strong">{num(r.deposit, 2)}</td>
                  <td className="r">{num(r.depositPerMetre, 3)}</td>
                  <td className="r">{num(r.grossConsumable, 2)}</td>
                  <td className="cell-note">{consumableText(r)}</td>

                  <td className="r">{num(r.arcRate, 2)}</td>
                  <td className="r">{num(r.arcTime, 2)}</td>
                  <td className="r">{num(r.operatingFactor, 2)}</td>
                  <td className="r strong">{num(r.weldingHours, 2)}</td>
                  <td className="r">{num(r.hoursPerMetre, 3)}</td>
                  <td className="r">{num(r.hoursPerJoint, 2)}</td>
                  <td className={`r ${r.hiExceeded ? 'bad' : ''}`}>{num(r.heatInput, 2)}</td>

                  <td>
                    <Pill tone={r.ndt.basis === 'linear' ? 'info' : 'default'}>{r.ndt.basis === 'linear' ? 'linear m' : 'per joint'}</Pill>
                  </td>
                  <td className="r">{num(r.ndt.metres, 2)}</td>
                  <td className="r">{num(r.ndt.joints, 1)}</td>
                  <td className="r">{r.ndt.films || '—'}</td>
                  <td className="r">{num(r.ndt.hours, 2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="sticky-l">
                  <b>TOTAL</b>
                  <span className="cell-sub">{results.length} scenarios</span>
                </td>
                <td colSpan={6} />
                <td className="r" />
                <td className="r" />
                <td className="r">{totals.passes}</td>
                <td className="r" />
                <td className="r">{totals.joints}</td>
                <td className="r">{num(totals.length, 2)}</td>
                <td className="r">{nf(totals.volume / 1000, 0)}</td>
                <td className="r strong">{num(totals.deposit, 2)}</td>
                <td className="r" />
                <td className="r strong">{num(totals.grossConsumable, 2)}</td>
                <td className="cell-note">
                  {totals.wireLength > 0 ? `${nf(totals.wireLength, 0)} m wire ` : ''}
                  {totals.electrodeCount > 0 ? `${nf(totals.electrodeCount, 0)} rods` : ''}
                </td>
                <td className="r" />
                <td className="r">{num(totals.arcTime, 1)}</td>
                <td className="r" />
                <td className="r strong">{num(totals.weldingHours, 1)}</td>
                <td className="r" />
                <td className="r" />
                <td className="r" />
                <td className="r" />
                <td className="r">{num(totals.ndtMetres, 2)}</td>
                <td className="r">{num(totals.ndtJoints, 1)}</td>
                <td className="r">{totals.films}</td>
                <td className="r">{num(totals.ndtHours, 1)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="two-col">
        <Card title="Worked breakdown" subtitle="Every scenario expanded with its arithmetic shown.">
          <div className="work-list">
            {results.map((r) => (
              <details key={r.s.id} className="work-item">
                <summary>
                  <b>{r.s.tag}</b> — {r.s.description}
                </summary>
                <table className="mini-table work-table">
                  <tbody>
                    <tr><td>Connection / base metal</td><td className="r">{r.connection.label} · {r.material.name}{r.material2 ? ` → ${r.material2.name}` : ''}</td></tr>
                    <tr><td>Filler metal</td><td className="r">{r.fillerLabel}</td></tr>
                    <tr><td>Weld cross-section (with cap &amp; root penetration)</td><td className="r">{num(r.geo.area, 2)} mm²</td></tr>
                    <tr><td>Length per joint × joints = total length</td><td className="r">{num(r.lengthPerJoint, 3)} × {r.joints} = {num(r.totalLength, 3)} m</td></tr>
                    <tr><td>Weld metal volume = A × L</td><td className="r">{num(r.geo.area, 2)} × {nf(r.totalLength * 1000, 0)} = {nf(r.volume, 0)} mm³</td></tr>
                    <tr><td>Deposit weight = V × ρ  (ρ = {nf(r.density, 0)} kg/m³)</td><td className="r">{num(r.deposit, 3)} kg</td></tr>
                    <tr><td>Gross consumable = deposit ÷ efficiency</td><td className="r">{num(r.deposit, 3)} ÷ {num(r.process.efficiency, 2)} = {num(r.grossConsumable, 3)} kg</td></tr>
                    {r.wireLength !== null && (
                      <tr><td>Wire length = gross ÷ mass/m</td><td className="r">{nf(r.wireLength, 0)} m</td></tr>
                    )}
                    {r.electrodeCount !== null && (
                      <tr><td>Electrode count = gross ÷ weight per electrode</td><td className="r">{nf(r.electrodeCount, 0)} pcs</td></tr>
                    )}
                    <tr><td>Arc time = deposit ÷ arc rate</td><td className="r">{num(r.deposit, 3)} ÷ {num(r.arcRate, 3)} = {num(r.arcTime, 3)} h</td></tr>
                    <tr><td>Welding hours = arc time ÷ operating factor</td><td className="r">{num(r.arcTime, 3)} ÷ {num(r.operatingFactor, 2)} = {num(r.weldingHours, 3)} h</td></tr>
                    <tr><td>Passes per joint = ⌈A ÷ bead area ({r.process.passArea} mm²)⌉</td><td className="r">{r.passesPerJoint}</td></tr>
                    <tr><td>Heat input = k·V·I·60 ÷ (1000·v)</td><td className={`r ${r.hiExceeded ? 'bad' : ''}`}>{num(r.heatInput, 3)} kJ/mm {r.hiExceeded ? `> limit ${r.hiLimit}` : ''}</td></tr>
                  </tbody>
                </table>
              </details>
            ))}
          </div>
        </Card>

        <Card title="Cross-check" subtitle="Sanity figures an engineer would look for.">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>Tag</th>
                <th className="r">kg per joint</th>
                <th className="r">h per joint</th>
                <th className="r">kg per metre</th>
                <th className="r">h per metre</th>
                <th className="r">Passes</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.s.id}>
                  <td>{r.s.tag}</td>
                  <td className="r">{r.joints ? num(r.deposit / r.joints, 2) : '—'}</td>
                  <td className="r">{r.joints ? num(r.weldingHours / r.joints, 2) : '—'}</td>
                  <td className="r">{num(r.depositPerMetre, 3)}</td>
                  <td className="r">{num(r.hoursPerMetre, 3)}</td>
                  <td className="r">{r.totalPasses}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note">
            Rules of thumb for a check: a 60° single-V butt weld deposits roughly 0.5–0.6 kg of weld metal per metre per 10 mm of
            thickness; SMAW labour is typically 1.5–3 h per kg of deposit once the operating factor is applied. On pipe, a joint
            takes about one welder-hour per 25 mm of wall thickness on small bore, falling to 0.3–0.5 h per joint on large bore
            automatic welding.
          </p>
        </Card>
      </div>
    </div>
  );
}

function consumableText(r: ScenarioResult): string {
  if (r.electrodeCount !== null) return `${nf(r.electrodeCount, 0)} electrodes ⌀${num(r.size.dia, 1)}`;
  const parts: string[] = [];
  if (r.wireLength !== null) parts.push(`${nf(r.wireLength, 0)} m ⌀${num(r.size.dia, 1)}`);
  if (r.flux !== null) parts.push(`flux ${num(r.flux, 1)} kg`);
  if (r.gas !== null) parts.push(`gas ${num(r.gas, 1)} m³`);
  return parts.join(' · ');
}
