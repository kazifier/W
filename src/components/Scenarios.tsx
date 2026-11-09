import { useState } from 'react';
import {
  JOINT_TYPES,
  MATERIALS,
  NDT_METHODS,
  POSITIONS,
  PROCESSES,
  jointTypeById,
  preheat,
} from '../lib/data';
import {
  COMPONENT_LABELS,
  connectionById,
  connectionsFor,
  type ComponentType,
} from '../lib/connections';
import { PIPE_SIZES, idFor, npsLabel, schedulesFor, wallFor } from '../lib/pipes';
import {
  applyComponent,
  applyComponentSize,
  applyConnection,
  computeScenario,
  makeScenario,
  type Scenario,
  type ScenarioResult,
} from '../lib/calc';
import { nf, num } from '../lib/format';
import { NumInput, OptNumInput, Pill, SelectInput, Stat, TextInput, Card, SectionTitle } from './ui';

interface Props {
  scenarios: Scenario[];
  onChange: (s: Scenario[]) => void;
}

export default function ScenariosPanel({ scenarios, onChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(scenarios[0]?.id ?? null);
  const results = scenarios.map(computeScenario);

  const update = (id: string, patch: Partial<Scenario>) => {
    onChange(scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const add = () => {
    const s = makeScenario({
      tag: nextTag(scenarios),
      description: 'New weld scenario',
      wpsNo: `WPS-${String(scenarios.length + 1).padStart(3, '0')}`,
    });
    onChange([...scenarios, s]);
    setOpenId(s.id);
  };

  const duplicate = (src: Scenario) => {
    const copy: Scenario = {
      ...src,
      id: Math.random().toString(36).slice(2, 9),
      tag: nextTag(scenarios),
      description: `${src.description} (copy)`,
    };
    onChange([...scenarios, copy]);
    setOpenId(copy.id);
  };

  const remove = (id: string) => onChange(scenarios.filter((s) => s.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const i = scenarios.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= scenarios.length) return;
    const copy = [...scenarios];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className="stack">
      <Card
        title="Weld scenarios"
        subtitle="Each row is an independent weld case: component and connection, base metal (or dissimilar pair), joint detail, process, extent and its own NDT sampling."
        right={<button className="btn btn-primary" onClick={add}>+ Add scenario</button>}
      >
        <div className="scn-list">
          {results.map((r, i) => (
            <ScenarioRow
              key={r.s.id}
              r={r}
              index={i}
              open={openId === r.s.id}
              onToggle={() => setOpenId(openId === r.s.id ? null : r.s.id)}
              onUpdate={(patch) => update(r.s.id, patch)}
              onDuplicate={() => duplicate(r.s)}
              onRemove={() => remove(r.s.id)}
              onMove={(d) => move(r.s.id, d)}
              canUp={i > 0}
              canDown={i < results.length - 1}
            />
          ))}
          {results.length === 0 && <p className="empty">No scenarios yet — add one to start the calculation.</p>}
        </div>
      </Card>
    </div>
  );
}

function nextTag(list: Scenario[]): string {
  const nums = list.map((s) => {
    const m = s.tag.match(/(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  return `S-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0')}`;
}

function ScenarioRow({
  r, index, open, onToggle, onUpdate, onDuplicate, onRemove, onMove, canUp, canDown,
}: {
  r: ScenarioResult;
  index: number;
  open: boolean;
  onToggle: () => void;
  onUpdate: (p: Partial<Scenario>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (d: -1 | 1) => void;
  canUp: boolean;
  canDown: boolean;
}) {
  const s = r.s;
  const jt = jointTypeById(s.jointKind);
  const conn = connectionById(s.connectionId);
  const ph = preheat(r.material, s.thickness);

  return (
    <div className={`scn ${open ? 'scn-open' : ''}`}>
      <div className="scn-head" onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle()}>
        <span className="scn-idx">{String(index + 1).padStart(2, '0')}</span>
        <span className="scn-tag">{s.tag}</span>
        <span className="scn-desc">
          {s.description || 'Untitled'}
          <em className="scn-meta">
            {COMPONENT_LABELS[conn.component]} · {conn.label} · {r.material.name}
            {r.material2 ? ` → ${r.material2.name}` : ''} · {jt.short} · t={num(s.thickness, 1)} mm · {r.process.abbr} · {nf(r.totalLength, 2)} m
          </em>
        </span>
        <span className="scn-kpis">
          <span><b>{num(r.deposit, 1)}</b> kg</span>
          <span><b>{num(r.weldingHours, 1)}</b> h</span>
          <span><b>{num(r.geo.area, 0)}</b> mm²</span>
        </span>
        <span className="scn-actions" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" title="Move up" disabled={!canUp} onClick={() => onMove(-1)}>↑</button>
          <button className="icon-btn" title="Move down" disabled={!canDown} onClick={() => onMove(1)}>↓</button>
          <button className="icon-btn" title="Duplicate" onClick={() => onDuplicate()}>⧉</button>
          <button className="icon-btn icon-danger" title="Delete" onClick={() => onRemove()}>✕</button>
          <span className="chev">{open ? '▾' : '▸'}</span>
        </span>
      </div>

      {open && (
        <div className="scn-body">
          <div className="kpi-strip">
            <Stat label="Cross-section area" value={num(r.geo.area, 1)} unit="mm²" />
            <Stat label="Weld volume" value={nf(r.volume / 1000, 1)} unit="cm³" />
            <Stat label="Deposit weight" value={num(r.deposit, 2)} unit="kg" />
            <Stat label="Passes / joint" value={r.passesPerJoint} />
            <Stat label="Arc time" value={num(r.arcTime, 2)} unit="h" />
            <Stat label="Welding hours" value={num(r.weldingHours, 2)} unit="h" />
            <Stat label="Heat input" value={num(r.heatInput, 2)} unit="kJ/mm" tone={r.hiExceeded ? 'warn' : 'ok'} />
            <Stat label="Preheat" value={ph.min === 10 ? 'ambient' : `${ph.min}–${ph.max}`} unit={ph.min === 10 ? '' : '°C'} />
          </div>

          <div className="scn-grid">
            <div className="scn-col">
              <SectionTitle n="1">Identification</SectionTitle>
              <div className="grid-2">
                <TextInput label="Scenario tag" value={s.tag} onChange={(v) => onUpdate({ tag: v })} />
                <TextInput label="WPS / PQR reference" value={s.wpsNo} onChange={(v) => onUpdate({ wpsNo: v })} />
              </div>
              <TextInput label="Description" value={s.description} onChange={(v) => onUpdate({ description: v })} />

              <SectionTitle n="2">Component & connection</SectionTitle>
              <div className="grid-2">
                <SelectInput
                  label="Component type"
                  value={s.component}
                  onChange={(v) => onUpdate(applyComponent(s, v as ComponentType))}
                  options={(['pipe', 'plate', 'tube'] as ComponentType[]).map((c) => ({ value: c, label: COMPONENT_LABELS[c] }))}
                />
                <SelectInput
                  label="Connection / joint location"
                  value={s.connectionId}
                  onChange={(v) => onUpdate(applyConnection(s, v))}
                  options={connectionsFor(s.component).map((c) => ({ value: c.id, label: c.label }))}
                />
              </div>
              <p className="note tight">{conn.detail}</p>

              {conn.component === 'pipe' && (
                <>
                  <div className="grid-2">
                    <SelectInput
                      label="Pipe size (NPS)"
                      value={s.nps}
                      onChange={(v) => onUpdate(applyComponentSize({ ...s, nps: Number(v) }))}
                      options={[...PIPE_SIZES.map((p) => ({ value: p.nps, label: `${p.label} — OD ${p.od} mm` })), { value: 0, label: 'Custom / non-standard OD' }]}
                    />
                    {s.nps === 0 ? (
                      <NumInput
                        label="Wall thickness (custom)"
                        value={s.thickness}
                        unit="mm"
                        step={0.1}
                        min={0.5}
                        onChange={(v) => onUpdate({ thickness: v })}
                      />
                    ) : (
                      <SelectInput
                        label="Schedule"
                        value={s.schedule}
                        onChange={(v) => onUpdate(applyComponentSize({ ...s, schedule: String(v) }))}
                        options={schedulesFor(s.nps).map((sc) => ({ value: sc, label: `Sch ${sc} — ${num(wallFor(s.nps, sc), 2)} mm` }))}
                      />
                    )}
                  </div>
                  {s.nps === 0 && (
                    <NumInput
                      label="Outside diameter (custom)"
                      value={s.od}
                      unit="mm"
                      step={1}
                      min={10}
                      onChange={(v) => onUpdate({ od: v })}
                    />
                  )}
                  <div className="readout">
                    <div><span>Outside diameter</span><b>{num(s.nps === 0 ? s.od : (PIPE_SIZES.find((p) => p.nps === s.nps)?.od ?? s.od), 1)} mm</b></div>
                    <div><span>Nominal wall thickness</span><b>{num(s.thickness, 2)} mm</b></div>
                    <div><span>Inside diameter</span><b>{num(s.nps === 0 ? s.od - 2 * s.thickness : idFor(s.nps, s.schedule), 1)} mm</b></div>
                    <div><span>Weld length per joint</span><b>{num(r.lengthPerJoint, 4)} m (π × OD)</b></div>
                  </div>
                  <NumInput label="Number of joints" value={s.joints} step={1} min={0} onChange={(v) => onUpdate({ joints: Math.round(v) })} />
                </>
              )}

              {conn.component === 'tube' && (
                <>
                  <div className="grid-2">
                    <NumInput
                      label="Tube outside diameter"
                      value={s.tubeOd}
                      unit="mm"
                      step={0.1}
                      min={1}
                      onChange={(v) => onUpdate(applyComponentSize({ ...s, tubeOd: v }))}
                      hint="e.g. 19.05 / 25.4 / 31.75 mm"
                    />
                    <NumInput
                      label="Tube wall thickness"
                      value={s.tubeWall}
                      unit="mm"
                      step={0.1}
                      min={0.5}
                      onChange={(v) => onUpdate(applyComponentSize({ ...s, tubeWall: v }))}
                      hint="e.g. BWG 12–16"
                    />
                  </div>
                  <div className="grid-2">
                    <NumInput
                      label="Number of tubes (joints)"
                      value={s.tubeCount}
                      step={1}
                      min={0}
                      onChange={(v) => onUpdate(applyComponentSize({ ...s, tubeCount: Math.round(v) }))}
                    />
                    <NumInput
                      label="Tubesheet thickness"
                      value={s.tubesheet}
                      unit="mm"
                      step={1}
                      min={0}
                      onChange={(v) => onUpdate({ tubesheet: v })}
                      hint="For reference / joint design"
                    />
                  </div>
                  <div className="readout">
                    <div><span>Weld length per tube</span><b>{num(r.lengthPerJoint * 1000, 1)} mm (π × OD)</b></div>
                    <div><span>Total weld length</span><b>{num(r.totalLength, 2)} m</b></div>
                    <div><span>NDT sampling basis</span><b>{r.ndt.basis === 'linear' ? 'linear metre' : 'per joint (tube)'}</b></div>
                  </div>
                </>
              )}

              {conn.component === 'plate' && (
                <>
                  {conn.sizeSource === 'nps' ? (
                    <div className="grid-2">
                      <SelectInput
                        label="Nozzle size (NPS)"
                        value={s.nps}
                        onChange={(v) => onUpdate(applyComponentSize({ ...s, nps: Number(v) }))}
                        options={PIPE_SIZES.map((p) => ({ value: p.nps, label: `${p.label} — OD ${p.od} mm` }))}
                      />
                      <SelectInput
                        label="Nozzle schedule"
                        value={s.schedule}
                        onChange={(v) => onUpdate(applyComponentSize({ ...s, schedule: String(v) }))}
                        options={schedulesFor(s.nps).map((sc) => ({ value: sc, label: `Sch ${sc} — ${num(wallFor(s.nps, sc), 2)} mm` }))}
                      />
                    </div>
                  ) : (
                    <div className="grid-2">
                      <NumInput
                        label="Plate / shell thickness"
                        value={s.thickness}
                        unit="mm"
                        step={0.5}
                        min={1}
                        onChange={(v) => onUpdate({ thickness: v })}
                      />
                      {conn.lengthBasis === 'circ' ? (
                        <NumInput
                          label="Shell / vessel outside diameter"
                          value={s.od}
                          unit="mm"
                          step={1}
                          min={50}
                          onChange={(v) => onUpdate({ od: v })}
                          hint={`Weld length per joint ${num((Math.PI * s.od) / 1000, 3)} m`}
                        />
                      ) : (
                        <NumInput
                          label="Seam length per joint"
                          value={s.lengthPerJoint}
                          unit="m"
                          step={0.05}
                          min={0.01}
                          onChange={(v) => onUpdate({ lengthPerJoint: v })}
                          hint="Plate width / shell length"
                        />
                      )}
                    </div>
                  )}
                  {conn.sizeSource === 'nps' && (
                    <NumInput
                      label="Nozzle wall thickness"
                      value={s.thickness}
                      unit="mm"
                      step={0.1}
                      min={1}
                      onChange={(v) => onUpdate({ thickness: v })}
                      hint="Auto-filled from the schedule; override if the neck is thicker"
                    />
                  )}
                  <NumInput
                    label={conn.sizeSource === 'nps' ? 'Number of nozzles' : 'Number of seams'}
                    value={s.joints}
                    step={1}
                    min={0}
                    onChange={(v) => onUpdate({ joints: Math.round(v) })}
                  />
                </>
              )}

              <SectionTitle n="3">Base material</SectionTitle>
              <SelectInput
                label="Base material (side A)"
                value={s.materialId}
                onChange={(v) => onUpdate({ materialId: v })}
                options={MATERIALS.map((m) => ({ value: m.id, label: `${m.name} — ${m.spec}` }))}
              />

              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!s.materialId2}
                  onChange={(e) => onUpdate({ materialId2: e.target.checked ? (s.materialId === 'ss316l' ? 'a106b' : 'ss316l') : null })}
                />
                <span className="switch-track" />
                <span className="switch-label">Dissimilar metal joint</span>
              </label>

              {s.materialId2 && (
                <SelectInput
                  label="Base material (side B)"
                  value={s.materialId2}
                  onChange={(v) => onUpdate({ materialId2: v })}
                  options={MATERIALS.map((m) => ({ value: m.id, label: `${m.name} — ${m.spec}` }))}
                />
              )}

              <div className="readout">
                <div><span>{r.material2 ? 'Side A / side B' : 'Base material'}</span><b>{r.material2 ? `${r.material.name} / ${r.material2.name}` : r.material.name}</b></div>
                <div><span>{r.dissimilar ? 'Dissimilar filler' : 'Matching filler'}</span><b>{r.fillerLabel}</b></div>
                <div><span>Weld metal density</span><b>{nf(r.density, 0)} kg/m³</b></div>
                <div><span>SMYS / UTS (side A)</span><b>{r.material.smys} / {r.material.uts} MPa</b></div>
                <div><span>CE (IIW)</span><b>{r.material.ce || '—'}</b></div>
                <div><span>Max heat input</span><b>{r.hiLimit || '—'} kJ/mm</b></div>
                <div><span>Preheat</span><b>{ph.min === 10 ? 'None (≥10 °C)' : `${ph.min}–${ph.max} °C`}</b></div>
              </div>
              {r.dissimilar && (
                <p className={`note tight ${r.dissimilar.compatible ? '' : 'note-warn'}`}>
                  <b>Dissimilar joint:</b> {r.dissimilar.note}
                </p>
              )}
              {!r.dissimilar && <p className="note tight">{ph.note}</p>}
            </div>

            <div className="scn-col">
              <SectionTitle n="4">Joint configuration</SectionTitle>
              <SelectInput
                label="Joint type"
                value={s.jointKind}
                onChange={(v) => {
                  const def = JOINT_TYPES.find((j) => j.id === v);
                  onUpdate({
                    jointKind: v,
                    includedAngle: def?.angle ?? s.includedAngle,
                    rootGap: def?.gap ?? s.rootGap,
                    land: def?.land ?? s.land,
                    rootRadius: def?.radius ?? s.rootRadius,
                  });
                }}
                options={JOINT_TYPES.map((j) => ({ value: j.id, label: j.label }))}
                hint={jt.pass}
              />
              <div className="grid-2">
                {jt.usesLeg ? (
                  <NumInput label="Fillet leg length a" value={s.leg} unit="mm" step={0.5} min={0.5} onChange={(v) => onUpdate({ leg: v })} />
                ) : (
                  <NumInput label="Groove depth / thickness" value={s.thickness} unit="mm" step={0.5} min={0.5} onChange={(v) => onUpdate({ thickness: v })} />
                )}
                {jt.usesAngle && (
                  <NumInput label="Included angle α" value={s.includedAngle} unit="°" step={1} min={1} max={120} onChange={(v) => onUpdate({ includedAngle: v })} />
                )}
              </div>
              <div className="grid-2">
                {jt.usesGap ? (
                  <NumInput label="Root gap b" value={s.rootGap} unit="mm" step={0.5} min={0} onChange={(v) => onUpdate({ rootGap: v })} />
                ) : <div />}
                {jt.usesLand ? (
                  <NumInput label="Root face / land f" value={s.land} unit="mm" step={0.5} min={0} onChange={(v) => onUpdate({ land: v })} />
                ) : <div />}
              </div>
              <div className="grid-2">
                {jt.usesRadius ? (
                  <NumInput label="Root radius R" value={s.rootRadius} unit="mm" step={0.5} min={0} onChange={(v) => onUpdate({ rootRadius: v })} />
                ) : <div />}
                {jt.usesLeg ? (
                  <NumInput label="Convexity c" value={s.convexity} unit="mm" step={0.1} min={0} onChange={(v) => onUpdate({ convexity: v })} />
                ) : (
                  <NumInput label="Cap reinforcement r" value={s.reinforcement} unit="mm" step={0.5} min={0} onChange={(v) => onUpdate({ reinforcement: v })} />
                )}
              </div>
              <div className="grid-2">
                <NumInput label="Root penetration p" value={s.rootPenetration} unit="mm" step={0.5} min={0} onChange={(v) => onUpdate({ rootPenetration: v })} />
                <OptNumInput
                  label="Area override"
                  value={s.areaOverride}
                  unit="mm²"
                  step={5}
                  placeholder="use formula"
                  onChange={(v) => onUpdate({ areaOverride: v })}
                  hint="Optional: measured / WPS area"
                />
              </div>

              <div className="formula-box">
                <div className="fb-head">
                  <span>Cross-section area</span>
                  <Pill tone={r.geo.overridden ? 'warn' : 'info'}>{r.geo.overridden ? 'manual override' : 'calculated'}</Pill>
                </div>
                <code>{r.geo.expression}</code>
                <table className="mini-table">
                  <tbody>
                    {r.geo.terms.map((t) => (
                      <tr key={t.label}>
                        <td>{t.label}</td>
                        <td className="r">{num(t.value, 2)} mm²</td>
                      </tr>
                    ))}
                    <tr className="tr-total">
                      <td>Total weld metal cross-section A</td>
                      <td className="r">{num(r.geo.area, 2)} mm²</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="scn-col">
              <SectionTitle n="5">Process & productivity</SectionTitle>
              <SelectInput
                label="Welding process"
                value={s.processId}
                onChange={(v) => onUpdate({ processId: v, sizeIndex: 0 })}
                options={PROCESSES.map((p) => ({ value: p.id, label: `${p.abbr} — ${p.name}` }))}
                hint={r.process.notes}
              />
              <div className="grid-2">
                <SelectInput
                  label="Filler size"
                  value={s.sizeIndex}
                  onChange={(v) => onUpdate({ sizeIndex: Number(v) })}
                  options={r.process.sizes.map((sz, i) => ({ value: i, label: sz.label }))}
                />
                <SelectInput
                  label="Position"
                  value={s.positionId}
                  onChange={(v) => onUpdate({ positionId: v })}
                  options={POSITIONS.map((p) => ({ value: p.id, label: p.label }))}
                />
              </div>
              <div className="grid-3">
                <OptNumInput label="Arc rate" value={s.rateOverride} unit="kg/h" step={0.1} placeholder={num(r.size.rate * r.position.factor, 2)} onChange={(v) => onUpdate({ rateOverride: v })} hint="auto = size × position" />
                <OptNumInput label="Operating factor" value={s.ofOverride} step={0.05} placeholder={num(r.process.operatingFactor, 2)} onChange={(v) => onUpdate({ ofOverride: v })} hint="arc-on / paid time" />
                <OptNumInput label="Pass over-ride" value={s.passesOverride} step={1} placeholder={String(r.passesPerJoint)} onChange={(v) => onUpdate({ passesOverride: v })} hint={`auto = A / ${r.process.passArea} mm²`} />
              </div>

              <div className="readout">
                <div><span>Deposition efficiency</span><b>{num(r.process.efficiency * 100, 0)} %</b></div>
                <div><span>Arc rate (derated)</span><b>{num(r.arcRate, 2)} kg/h</b></div>
                <div><span>Total deposit</span><b>{num(r.deposit, 2)} kg</b></div>
                <div><span>Gross consumable</span><b>{num(r.grossConsumable, 2)} kg</b></div>
                {r.wireLength !== null && <div><span>{r.process.form === 'rod' ? 'Filler rod' : 'Wire'}</span><b>{nf(r.wireLength, 0)} m · {num(r.size.dia, 1)} mm ⌀</b></div>}
                {r.electrodeCount !== null && <div><span>Electrodes</span><b>{nf(r.electrodeCount, 0)} pcs · {num(r.size.dia, 1)} mm ⌀</b></div>}
                {r.flux !== null && <div><span>Flux</span><b>{num(r.flux, 1)} kg</b></div>}
                {r.gas !== null && <div><span>Shielding gas</span><b>{num(r.gas, 1)} m³</b></div>}
                <div><span>Arc time</span><b>{num(r.arcTime, 2)} h</b></div>
                <div><span>Total welding hours</span><b>{num(r.weldingHours, 2)} h</b></div>
                <div><span>Hours per metre</span><b>{num(r.hoursPerMetre, 3)} h/m</b></div>
                <div><span>Hours per joint</span><b>{num(r.hoursPerJoint, 2)} h</b></div>
              </div>

              <SectionTitle n="6">NDT sampling for this weld</SectionTitle>
              <SelectInput
                label="NDT basis"
                value={s.ndtBasis}
                onChange={(v) => onUpdate({ ndtBasis: v })}
                options={[
                  { value: 'auto', label: 'Auto (OD ≥ 1000 mm or linear → per metre)' },
                  { value: 'linear', label: 'Force linear-metre basis' },
                  { value: 'joint', label: 'Force per-joint basis' },
                ]}
                hint={`Resolved: ${r.ndt.basis === 'linear' ? 'linear metre' : 'per joint'} · ${npsLabel(s.nps)}`}
              />
              <div className="ndt-grid">
                {NDT_METHODS.map((m) => (
                  <NumInput
                    key={m.id}
                    label={m.abbr}
                    value={s.ndtPct[m.id] ?? 0}
                    unit="%"
                    step={5}
                    min={0}
                    max={100}
                    onChange={(v) => onUpdate({ ndtPct: { ...s.ndtPct, [m.id]: v } })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
