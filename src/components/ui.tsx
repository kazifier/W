import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Card({
  title,
  subtitle,
  right,
  children,
  className = '',
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || right) && (
        <header className="card-head">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {right && <div className="card-right">{right}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`field ${wide ? 'field-wide' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

const fmtRaw = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v));

export function NumInput({
  label,
  value,
  onChange,
  unit,
  step = 0.1,
  min,
  max,
  hint,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  disabled?: boolean;
}) {
  const [txt, setTxt] = useState(fmtRaw(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setTxt(fmtRaw(value));
  }, [value]);

  return (
    <Field label={label} hint={hint}>
      <span className="input-wrap">
        <input
          className="input input-num"
          type="number"
          value={txt}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          onFocus={() => (focused.current = true)}
          onBlur={() => {
            focused.current = false;
            setTxt(fmtRaw(value));
          }}
          onChange={(e) => {
            const raw = e.target.value;
            setTxt(raw);
            const n = Number(raw);
            if (raw.trim() !== '' && isFinite(n)) onChange(n);
            if (raw.trim() === '') onChange(0);
          }}
        />
        {unit && <span className="unit">{unit}</span>}
      </span>
    </Field>
  );
}

export function OptNumInput({
  label,
  value,
  onChange,
  unit,
  step = 0.1,
  placeholder = 'auto',
  hint,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  unit?: string;
  step?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <span className="input-wrap">
        <input
          className="input input-num"
          type="number"
          step={step}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw.trim() === '') return onChange(null);
            const n = Number(raw);
            if (isFinite(n)) onChange(n);
          }}
        />
        {unit && <span className="unit">{unit}</span>}
      </span>
    </Field>
  );
}

export function SelectInput<T extends string | number>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        className="input input-select"
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const found = options.find((o) => String(o.value) === raw);
          onChange((found ? found.value : raw) as T);
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Stat({ label, value, unit, tone }: { label: string; value: ReactNode; unit?: string; tone?: 'warn' | 'ok' | 'muted' }) {
  return (
    <div className={`stat ${tone ? `stat-${tone}` : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {value}
        {unit && <em className="stat-unit"> {unit}</em>}
      </span>
    </div>
  );
}

export function Pill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'warn' | 'ok' | 'info' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function SectionTitle({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <h3 className="sec-title">
      {n && <span className="sec-num">{n}</span>}
      {children}
    </h3>
  );
}
