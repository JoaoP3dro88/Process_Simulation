import { useEffect, useMemo, useState } from 'react'
import { api } from './services/api'

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

export default function Simulation({ onBack, products, parts, machines }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const [orders, setOrders] = useState([])
  const [activeOrderId, setActiveOrderId] = useState('')

  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: '1' }])

  const [machineView, setMachineView] = useState([])

  const productOptions = useMemo(
    () => (products || []).map(p => ({ id: p.id, label: `#${p.id} - ${p.name}` })),
    [products]
  )

  async function refreshOrders() {
    const all = await api.listSimulationOrders()
    setOrders(all)
  }

  async function refreshMachineView(orderId) {
    if (!orderId) return
    const view = await api.viewSimulationMachines(orderId)
    setMachineView(view)
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        await refreshOrders()
      } catch (e) {
        setError(e.message || 'Erro ao carregar simulação')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!activeOrderId) return
    ;(async () => {
      try {
        await refreshMachineView(activeOrderId)
      } catch (e) {
        setError(e.message || 'Erro ao carregar filas')
      }
    })()
  }, [activeOrderId])

  async function onCreateOrder(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const items = orderItems
        .map(it => ({
          product_id: toNumber(it.product_id),
          quantity: toNumber(it.quantity),
        }))
        .filter(it => Number.isFinite(it.product_id) && Number.isFinite(it.quantity))

      const created = await api.createSimulationOrder({ items })
      setOk(`Order criada (#${created.id})`)
      await refreshOrders()
      setActiveOrderId(String(created.id))
      setOrderItems([{ product_id: '', quantity: '1' }])
    } catch (e) {
      setError(e.message || 'Falha ao criar order')
    } finally {
      setLoading(false)
    }
  }

  async function onStart(machineId, jobId) {
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.startSimulationMachine(activeOrderId, machineId, jobId ? { job_id: jobId } : {})
      setOk('Iniciado')
      await refreshMachineView(activeOrderId)
    } catch (e) {
      setError(e.message || 'Falha ao iniciar')
    } finally {
      setLoading(false)
    }
  }

  async function onFinish(jobId) {
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.finishSimulationJob(activeOrderId, jobId)
      setOk('Finalizado')
      await refreshMachineView(activeOrderId)
    } catch (e) {
      setError(e.message || 'Falha ao finalizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-title">Simulação</div>
        <div className="topbar-actions">
          {onBack ? (
            <button className="btn" onClick={onBack} disabled={loading}>Voltar</button>
          ) : null}
        </div>
      </div>

      <main className="content">
        {error ? <div className="alert alert-error">{error}</div> : null}
        {ok ? <div className="alert alert-ok">{ok}</div> : null}

        <section className="section">
          <div className="section-header">
            <h2>Criar Order</h2>
          </div>

          <form className="card" onSubmit={onCreateOrder}>
            {orderItems.map((it, idx) => (
              <div className="row" key={idx}>
                <label className="field">
                  <span className="label">Product</span>
                  <select value={it.product_id} onChange={(e) => {
                    const next = [...orderItems]
                    next[idx] = { ...next[idx], product_id: e.target.value }
                    setOrderItems(next)
                  }}>
                    <option value="">Selecione…</option>
                    {productOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="label">Quantidade</span>
                  <input value={it.quantity} onChange={(e) => {
                    const next = [...orderItems]
                    next[idx] = { ...next[idx], quantity: e.target.value }
                    setOrderItems(next)
                  }} />
                </label>

                <div className="field" style={{ alignSelf: 'end' }}>
                  <button className="btn" type="button" onClick={() => setOrderItems([...orderItems, { product_id: '', quantity: '1' }])} disabled={loading}>
                    + Item
                  </button>
                </div>

                <div className="field" style={{ alignSelf: 'end' }}>
                  <button className="btn btn-danger" type="button" onClick={() => {
                    if (orderItems.length === 1) return
                    setOrderItems(orderItems.filter((_, i) => i !== idx))
                  }} disabled={loading || orderItems.length === 1}>
                    Remover
                  </button>
                </div>
              </div>
            ))}

            <div className="row">
              <button className="btn" type="submit" disabled={loading}>Criar order</button>
            </div>
          </form>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Orders</h2>
          </div>

          <div className="card">
            <div className="row">
              <label className="field">
                <span className="label">Order ativa</span>
                <select value={activeOrderId} onChange={(e) => setActiveOrderId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>#{o.id} ({o.status})</option>
                  ))}
                </select>
              </label>

              <div className="field" style={{ alignSelf: 'end' }}>
                <button className="btn" type="button" onClick={() => refreshMachineView(activeOrderId)} disabled={loading || !activeOrderId}>
                  Atualizar filas
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Filas por máquina (capacidade paralela)</h2>
          </div>

          {!activeOrderId ? (
            <div className="card">Selecione uma order para ver as filas.</div>
          ) : (
            <div className="grid">
              {machineView.map((entry) => (
                <div className="card" key={entry.machine.id}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{entry.machine.name} (#{entry.machine.id})</div>
                      <div className="muted">Capacidade: {entry.machine.capacity}</div>
                    </div>
                    <button className="btn" disabled={loading} onClick={() => onStart(entry.machine.id, null)}>
                      Iniciar próximo
                    </button>
                  </div>

                  <div className="hr" />

                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Rodando</div>
                  {(entry.running || []).length === 0 ? (
                    <div className="muted">(vazio)</div>
                  ) : (
                    <ul>
                      {entry.running.map((j) => (
                        <li key={j.id} className="row" style={{ justifyContent: 'space-between' }}>
                          <span>Job #{j.id} (part {j.part_id})</span>
                          <button className="btn" disabled={loading} onClick={() => onFinish(j.id)}>Finalizar etapa</button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="hr" />

                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Fila</div>
                  {(entry.queue || []).length === 0 ? (
                    <div className="muted">(vazio)</div>
                  ) : (
                    <ul>
                      {entry.queue.slice(0, 10).map((j) => (
                        <li key={j.id} className="row" style={{ justifyContent: 'space-between' }}>
                          <span>
                            Job #{j.id} (part {j.part_id}) → op {j.next_operation?.name ?? j.next_operation?.id}
                          </span>
                          <button className="btn" disabled={loading} onClick={() => onStart(entry.machine.id, j.id)}>
                            Iniciar este
                          </button>
                        </li>
                      ))}
                      {entry.queue.length > 10 ? <li className="muted">+{entry.queue.length - 10}…</li> : null}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ marginTop: 12 }}>
            <div className="muted">
              Observações do MVP: a ordem das operações do workflow está sendo inferida por <b>operation.id</b> (não há coluna de sequência ainda).
              Ao finalizar o último passo do job, 1 unidade da Part é adicionada no <b>Market final</b> via MarketPartQuantity.
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
