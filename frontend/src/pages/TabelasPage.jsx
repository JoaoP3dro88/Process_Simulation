import { useMemo, useState } from 'react'

function Table({ rows }) {
  if (!rows || rows.length === 0) return <div className="muted">(vazio)</div>

  const cols = Object.keys(rows[0])

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {cols.map(c => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id ?? idx}>
              {cols.map(c => <td key={c}>{String(r[c] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TabelasPage({
  operations,
  workflows,
  parts,
  products,
  processes,
  workstations,
  machines,
  operators,
  markets,
  marketPartQuantities,
}) {
  const tables = useMemo(() => ([
    { key: 'operations', label: 'Operations', rows: operations },
    { key: 'workflows', label: 'Workflows', rows: workflows },
    { key: 'parts', label: 'Parts', rows: parts },
    { key: 'products', label: 'Products', rows: products },
    { key: 'processes', label: 'Processes', rows: processes },
    { key: 'workstations', label: 'Workstations', rows: workstations },
    { key: 'machines', label: 'Machines', rows: machines },
    { key: 'operators', label: 'Operators', rows: operators },
    { key: 'markets', label: 'Markets', rows: markets },
    { key: 'marketPartQuantities', label: 'Market-Part-Quantities', rows: marketPartQuantities },
  ]), [
    operations,
    workflows,
    parts,
    products,
    processes,
    workstations,
    machines,
    operators,
    markets,
    marketPartQuantities,
  ])

  const [active, setActive] = useState('operations')
  const current = tables.find(t => t.key === active)

  return (
    <div className="grid">
      <section className="section">
        <div className="section-header">
          <h2>Tabelas do banco</h2>
        </div>

        <div className="row">
          <label className="field">
            <span className="label">Tabela</span>
            <select value={active} onChange={(e) => setActive(e.target.value)}>
              {tables.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </label>
          <div className="pill">{current?.rows?.length ?? 0} registros</div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>{current?.label}</div>
          <Table rows={current?.rows ?? []} />
        </div>
      </section>

      <div className="footer muted">
        Se você quiser, eu também posso adicionar filtros/ordenação e um “ver detalhes” por linha.
      </div>
    </div>
  )
}
