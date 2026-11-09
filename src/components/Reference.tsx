import { JOINT_TYPES, MATERIALS, NDT_METHODS, POSITIONS, PROCESSES, jointTypeById, preheat } from '../lib/data';
import { COMPONENT_LABELS, CONNECTIONS, DISSIMILAR_TABLE } from '../lib/connections';
import { PIPE_SIZES } from '../lib/pipes';
import { Card, Pill } from './ui';

const FORMULAS: { title: string; formula: string; note: string }[] = [
  {
    title: 'Weld metal cross-section — single V butt',
    formula: 'A = b·t + (t − f)²·tan(α/2) + ⅔·w·r + ⅔·b·p',
    note: 'b = root gap, t = thickness, f = root face (land), α = included angle, w = cap width = b + 2(t−f)·tan(α/2), r = cap reinforcement height, p = root penetration.',
  },
  {
    title: 'Weld metal cross-section — double V butt',
    formula: 'A = b·t + 2·(t/2 − f)²·tan(α/2) + 2·⅔·w·r',
    note: 'Each side is a V to half the thickness; the root gap column is counted once through the full thickness.',
  },
  {
    title: 'Weld metal cross-section — single bevel / corner',
    formula: 'A = b·t + ½·(t − f)²·tan(α)',
    note: 'One flank only. Double bevel doubles the flank term and takes the depth as t/2.',
  },
  {
    title: 'Weld metal cross-section — U and J grooves',
    formula: 'A = b·t + (t − f − R)²·tan(α/2) + 0.429·R²   (U)   |   A = b·t + ½(t − f − R)²·tan(α) + 0.429·R²   (J)',
    note: 'R = root radius. The 0.429·R² term is the area between the square root corner and the root arc. U and J preps have small included angles (typically 20° and 40°), which is why they need far less weld metal than a 60° V.',
  },
  {
    title: 'Fillet weld cross-section',
    formula: 'A = ½·a² + ⅔·√2·a·c + ⅔·a·p',
    note: 'a = leg length, c = convexity, p = root penetration. Theoretical throat = a·cos45° = 0.707a. Double fillet = 2 × A.',
  },
  {
    title: 'Weld metal volume and deposit weight',
    formula: 'V = A × L  (mm³)      W = V × ρ × 10⁻⁹  (kg)',
    note: 'L in mm, ρ in kg/m³. Per metre of weld: W = A × ρ × 10⁻⁶ kg/m — e.g. 240 mm² at 7850 kg/m³ gives 1.88 kg/m.',
  },
  {
    title: 'Gross consumable',
    formula: 'W_gross = W_deposit / η',
    note: 'η is deposition efficiency: fraction of purchased filler that becomes weld metal (stub, spatter, tip and slag losses). SMAW ≈ 0.55–0.65, FCAW ≈ 0.85–0.88, GMAW ≈ 0.93–0.95, SAW ≈ 0.99, GTAW ≈ 0.98.',
  },
  {
    title: 'Wire length / electrode count',
    formula: 'L_wire = W_gross / (π/4 · d² · ρ·10⁻⁹)      n_rods = ⌈W_gross / m_rod⌉',
    note: 'Wire mass per metre = π/4·d²·1000·ρ·10⁻⁹ kg/m (1.2 mm steel ≈ 8.9 g/m). A coated electrode is taken as 3.0 × the core-wire mass to include the flux coating.',
  },
  {
    title: 'Flux and shielding gas',
    formula: 'm_flux = W_gross × k_flux      V_gas = Q × 60 × t_arc',
    note: 'k_flux ≈ 0.9 kg flux per kg wire for single-wire SAW (recovered flux is not counted); Q = gas flow in L/min, t_arc in hours, result in litres — divide by 1000 for m³.',
  },
  {
    title: 'Welding hours',
    formula: 't_arc = W_deposit / R      H = t_arc / OF',
    note: 'R = deposition rate in kg per arc-hour (derated for position), OF = operating factor = arc-on time ÷ paid time. SMAW 0.25–0.35, GMAW 0.45–0.55, FCAW 0.45, SAW 0.70–0.80, GTAW 0.30–0.40.',
  },
  {
    title: 'Number of passes',
    formula: 'n = ⌈A / A_bead⌉',
    note: 'A_bead is the practical bead cross-section per pass: SMAW ≈ 30–35 mm², GMAW/FCAW ≈ 25–35 mm², SAW ≈ 60–90 mm². Use the WPS pass schedule where one exists.',
  },
  {
    title: 'Heat input',
    formula: 'HI = k · V · I · 60 / (1000 · v)   [kJ/mm]',
    note: 'k = arc transfer efficiency (0.8 SMAW/GMAW/FCAW, 0.9 SAW, 0.6 GTAW), V in volts, I in amps, v = travel speed in mm/min. Compare with the material limit — duplex and quenched-and-tempered steels are heat-input sensitive.',
  },
  {
    title: 'Carbon equivalent and preheat',
    formula: 'CE_IIW = C + Mn/6 + (Cr + Mo + V)/5 + (Ni + Cu)/15',
    note: 'CE ≤ 0.40 → normally no preheat for t ≤ 25 mm. CE 0.40–0.45 → 50–100 °C. CE > 0.45 or t > 50 mm → 100–150 °C minimum. Cr-Mo steels need 150–200 °C plus PWHT.',
  },
  {
    title: 'NDT quantity — linear metre basis',
    formula: 'L_ndt = % × L_total      films = ⌈L_ndt / 0.30 m⌉',
    note: 'Applied when OD ≥ 1000 mm or the weld is straight/longitudinal. 0.30 m is the effective length of a 300 mm film with 20 % overlap.',
  },
  {
    title: 'NDT quantity — per joint basis',
    formula: 'n_ndt = ⌈% × n_joints⌉      films = exposures_per_joint × n_ndt',
    note: 'Applied to pipe below 1 m outside diameter. Exposures per joint = max(3, ⌈π·OD / 0.30⌉). Round up — you cannot examine part of a joint.',
  },
];

export default function ReferencePanel() {
  return (
    <div className="stack">
      <Card title="Formula sheet" subtitle="Every relationship used by the calculation, with the meaning of each term.">
        <div className="formula-list">
          {FORMULAS.map((f) => (
            <div className="formula-item" key={f.title}>
              <h3>{f.title}</h3>
              <code>{f.formula}</code>
              <p>{f.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Joint configuration library" subtitle="Default groove details per ISO 9692-1 / ASME IX Fig. QW-422. All fields are editable per scenario.">
        <div className="table-scroll">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>Joint</th>
                <th>Code</th>
                <th className="r">Included angle</th>
                <th className="r">Root gap</th>
                <th className="r">Land</th>
                <th className="r">Root radius</th>
                <th>Typical range</th>
              </tr>
            </thead>
            <tbody>
              {JOINT_TYPES.map((j) => (
                <tr key={j.id}>
                  <td>{j.label}</td>
                  <td><Pill>{j.short}</Pill></td>
                  <td className="r">{j.usesAngle ? `${j.angle}°` : '—'}</td>
                  <td className="r">{j.usesGap ? `${j.gap} mm` : '—'}</td>
                  <td className="r">{j.usesLand ? `${j.land} mm` : '—'}</td>
                  <td className="r">{j.usesRadius ? `${j.radius} mm` : '—'}</td>
                  <td className="cell-note">{j.pass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Connection library by component" subtitle="Choosing a component type narrows the connection list; choosing a connection sets the default joint type, the weld-length basis and the NDT sampling.">
        <div className="table-scroll">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>Component</th>
                <th>Connection</th>
                <th>Default joint</th>
                <th>Weld length basis</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {CONNECTIONS.map((c) => (
                <tr key={c.id}>
                  <td>{COMPONENT_LABELS[c.component]}</td>
                  <td><b>{c.label}</b></td>
                  <td><Pill>{jointTypeById(c.jointKind).short}</Pill></td>
                  <td className="cell-note">{c.lengthBasis === 'circ' ? 'π × OD per joint' : 'fixed seam length'}</td>
                  <td className="cell-note">{c.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Pipe size and schedule table" subtitle="ASME B36.10 / B36.19 nominal wall thickness in mm. Verify against the project pipe class before issue.">
        <div className="table-scroll">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>NPS</th>
                <th className="r">OD (mm)</th>
                {['10S', '20', '30', '40', 'STD', '60', '80', 'XS', '100', '120', '160', 'XXS'].map((s) => (
                  <th key={s} className="r">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PIPE_SIZES.map((p) => (
                <tr key={p.nps}>
                  <td><b>{p.label}</b></td>
                  <td className="r">{p.od.toFixed(1)}</td>
                  {['10S', '20', '30', '40', 'STD', '60', '80', 'XS', '100', '120', '160', 'XXS'].map((s) => (
                    <td key={s} className="r">{p.sch[s] !== undefined ? p.sch[s].toFixed(2) : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Dissimilar metal joints — filler selection" subtitle="Filler is chosen from the material group pair. The deposited weld metal density drives the deposit weight, so it is taken from the filler, not the base metal.">
        <div className="table-scroll">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>Base metal pair</th>
                <th>Filler metal</th>
                <th className="r">Weld metal density</th>
                <th>Guidance</th>
              </tr>
            </thead>
            <tbody>
              {DISSIMILAR_TABLE.map((d) => (
                <tr key={d.pair}>
                  <td><b>{d.pair}</b></td>
                  <td>{d.filler}</td>
                  <td className="r">{d.density} kg/m³</td>
                  <td className="cell-note">{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          Groups: CS carbon steel, LAS low-alloy / Cr-Mo, SS austenitic stainless, DSS duplex, NI nickel alloy, AL aluminium,
          CU copper-nickel, TI titanium. Where preheat is required, the ferritic side governs; the austenitic side limits
          interpass temperature instead. The heat-input check uses the lower of the two material limits.
        </p>
      </Card>

      <Card title="Process data used" subtitle="Deposition rate is flat position; the sheet derates it by the position factor.">
        <div className="table-scroll">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>Process</th>
                <th className="r">Deposition efficiency</th>
                <th className="r">Operating factor</th>
                <th className="r">Bead area (mm²)</th>
                <th>Filler sizes → arc rate (kg/h)</th>
                <th className="r">V / A / travel</th>
                <th className="r">HI (kJ/mm)</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSES.map((p) => {
                const k = p.id === 'gtaw' ? 0.6 : p.id.includes('saw') || p.id === 'egw' ? 0.9 : 0.8;
                const hi = (k * p.voltage * p.current * 60) / (1000 * p.travel);
                return (
                  <tr key={p.id}>
                    <td><b>{p.abbr}</b> <span className="cell-sub-inline">{p.name}</span></td>
                    <td className="r">{Math.round(p.efficiency * 100)} %</td>
                    <td className="r">{p.operatingFactor.toFixed(2)}</td>
                    <td className="r">{p.passArea}</td>
                    <td className="cell-note">{p.sizes.map((s) => `${s.label}: ${s.rate}`).join(' · ')}</td>
                    <td className="r">{p.voltage} V / {p.current} A / {p.travel}</td>
                    <td className="r">{hi.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <h3 className="sec-title mt">Position derating factors</h3>
        <div className="pill-row">
          {POSITIONS.map((p) => (
            <Pill key={p.id} tone={p.factor === 1 ? 'ok' : p.factor < 0.7 ? 'warn' : 'default'}>
              {p.label} — ×{p.factor}
            </Pill>
          ))}
        </div>
      </Card>

      <Card title="Material data used" subtitle="Density drives the deposit weight; CE and heat-input limit drive the thermal checks.">
        <div className="table-scroll">
          <table className="grid-table compact">
            <thead>
              <tr>
                <th>Material</th>
                <th>Specification</th>
                <th className="r">Density (kg/m³)</th>
                <th className="r">SMYS (MPa)</th>
                <th className="r">UTS (MPa)</th>
                <th className="r">CE</th>
                <th className="r">Max HI (kJ/mm)</th>
                <th className="r">Preheat @ 25 mm</th>
                <th>Matching filler</th>
              </tr>
            </thead>
            <tbody>
              {MATERIALS.map((m) => {
                const ph = preheat(m, 25);
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td className="cell-note">{m.spec}</td>
                    <td className="r">{m.density}</td>
                    <td className="r">{m.smys}</td>
                    <td className="r">{m.uts}</td>
                    <td className="r">{m.ce || '—'}</td>
                    <td className="r">{m.maxHI || '—'}</td>
                    <td className="r">{ph.min === 10 ? 'none' : `${ph.min}–${ph.max} °C`}</td>
                    <td className="cell-note">{m.filler}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="NDT methods and unit rates" subtitle="Unit hours are examination time only.">
        <table className="grid-table compact">
          <thead>
            <tr>
              <th>Method</th>
              <th className="r">Default sample</th>
              <th className="r">h per joint</th>
              <th className="r">h per metre</th>
              <th>Typical standard</th>
            </tr>
          </thead>
          <tbody>
            {NDT_METHODS.map((m) => (
              <tr key={m.id}>
                <td><b>{m.abbr}</b> <span className="cell-sub-inline">{m.name}</span></td>
                <td className="r">{m.pctDefault} %</td>
                <td className="r">{m.hoursPerJoint.toFixed(2)}</td>
                <td className="r">{m.hoursPerMetre.toFixed(2)}</td>
                <td className="cell-note">{m.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Scope, assumptions and limitations">
        <ul className="bullets">
          <li>The cross-section area is a theoretical geometric area. It does not account for fit-up variation, distortion correction, repair welding or weld-profile tolerances.</li>
          <li>Groove dimensions default to ISO 9692-1 values. If the WPS or a qualified PQR states different root gap, land or angle, enter those values — or override the area directly with a measured figure.</li>
          <li>Deposition rates and operating factors are shop-floor averages. Site work in poor weather, confined space or height typically runs 15–30 % lower.</li>
          <li>Purging gas, back-shielding, preheat fuel, PWHT and grinding discs are outside this sheet.</li>
          <li>Heat input is calculated from the nominal WPS parameters, not from measured arc data. It is a check against the material limit, not a substitute for monitoring.</li>
          <li>NDT percentages follow the contract or code sampling rules entered by the user. The sheet does not decide acceptance criteria — see ASME B31.3 Ch. VI, API 1104 Cl. 9 or ISO 5817 level B/C/D.</li>
        </ul>
      </Card>
    </div>
  );
}
