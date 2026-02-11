import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { api } from './services/api'

function Section({ title, children }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [operations, setOperations] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [parts, setParts] = useState([])

  const [newOperationName, setNewOperationName] = useState('')
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newPartName, setNewPartName] = useState('')
  const [newPartWorkflowId, setNewPartWorkflowId] = useState('')

  const workflowOptions = useMemo(() => workflows.map(w => ({ id: w.id, name: w.name ?? `Workflow #${w.id}` })), [workflows])

  async function refreshAll() {
    setLoading(true)
    setError('')
    try {
      const [ops, wfs, pts] = await Promise.all([
        api.listOperations(),
        api.listWorkflows(),
        api.listParts(),
      ])
      setOperations(ops)
      setWorkflows(wfs)
      setParts(pts)
    } catch (e) {
      setError(e.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  async function onCreateOperation(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.createOperation({ name: newOperationName })
      setNewOperationName('')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateWorkflow(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.createWorkflow({ name: newWorkflowName })
      setNewWorkflowName('')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreatePart(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const workflow_id = Number(newPartWorkflowId)
      await api.createPart({ name: newPartName, workflow_id })
      setNewPartName('')
      setNewPartWorkflowId('')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Process Simulation</h1>
        <div className="header-actions">
          <button onClick={refreshAll} disabled={loading}>Recarregar</button>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}
      {loading ? <div className="muted">Carregando...</div> : null}

      <div className="grid">
        <Section title="Operations">
          <form className="row" onSubmit={onCreateOperation}>
            <input
              value={newOperationName}
              onChange={(e) => setNewOperationName(e.target.value)}
              placeholder="Nome da operação"
              required
            />
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <ul className="list">
            {operations.map(op => (
              <li key={op.id} className="list-item">
                <span>#{op.id}</span>
                <span className="strong">{op.name ?? '(sem nome)'}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Workflows">
          <form className="row" onSubmit={onCreateWorkflow}>
            <input
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="Nome do workflow"
              required
            />
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <ul className="list">
            {workflows.map(wf => (
              <li key={wf.id} className="list-item">
                <span>#{wf.id}</span>
                <span className="strong">{wf.name ?? `(Workflow #${wf.id})`}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Parts (Workflow obrigatório e 1:1)">
          <form className="row" onSubmit={onCreatePart}>
            <input
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              placeholder="Nome da part"
              required
            />
            <select
              value={newPartWorkflowId}
              onChange={(e) => setNewPartWorkflowId(e.target.value)}
              required
            >
              <option value="" disabled>Selecione um workflow</option>
              {workflowOptions.map(w => (
                <option key={w.id} value={String(w.id)}>{w.name}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <div className="muted">
            Dica: tente criar duas parts com o mesmo workflow para validar a regra 1:1 (deve falhar).
          </div>

          <ul className="list">
            {parts.map(p => (
              <li key={p.id} className="list-item">
                <span>#{p.id}</span>
                <span className="strong">{p.name ?? '(sem nome)'}</span>
                <span className="pill">workflow_id: {p.workflow_id}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}