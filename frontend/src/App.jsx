import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { api } from './services/api'

function Section({ title, children, id }) {
  return (
    <section className="section" id={id}>
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Nav({ items }) {
  return (
    <nav className="nav">
      <div className="nav-title">CRUD Tester</div>
      <div className="nav-items">
        {items.map((it) => (
          <a key={it.id} href={`#${it.id}`} className="nav-link">{it.label}</a>
        ))}
      </div>
    </nav>
  )
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const [operations, setOperations] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [parts, setParts] = useState([])
  const [products, setProducts] = useState([])
  const [processes, setProcesses] = useState([])
  const [workstations, setWorkstations] = useState([])
  const [machines, setMachines] = useState([])
  const [operators, setOperators] = useState([])
  const [markets, setMarkets] = useState([])
  const [marketPartQuantities, setMarketPartQuantities] = useState([])

  // detail viewers
  const [processWorkstations, setProcessWorkstations] = useState([])
  const [processParts, setProcessParts] = useState([])
  const [workstationMachines, setWorkstationMachines] = useState([])
  const [workstationOperators, setWorkstationOperators] = useState([])
  const [machineOperations, setMachineOperations] = useState([])
  const [machineWorkstation, setMachineWorkstation] = useState(null)
  const [marketDemands, setMarketDemands] = useState(null)

  // create forms
  const [newOperationName, setNewOperationName] = useState('')
  const [newOperationDuration, setNewOperationDuration] = useState('')
  const [newPartName, setNewPartName] = useState('')
  const [newPartWorkflowId, setNewPartWorkflowId] = useState('')
  const [newProductName, setNewProductName] = useState('')
  const [newProcessName, setNewProcessName] = useState('')
  const [newWorkstationProcessId, setNewWorkstationProcessId] = useState('')
  const [newMachineName, setNewMachineName] = useState('')
  const [newMachineCapacity, setNewMachineCapacity] = useState('')
  const [newOperatorName, setNewOperatorName] = useState('')
  const [newMarketLastProcessId, setNewMarketLastProcessId] = useState('')
  const [newMarketNextProcessId, setNewMarketNextProcessId] = useState('')
  const [newMpqMarketId, setNewMpqMarketId] = useState('')
  const [newMpqPartId, setNewMpqPartId] = useState('')
  const [newMpqQuantity, setNewMpqQuantity] = useState('')

  // relationship actions
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')
  const [selectedOperationId, setSelectedOperationId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedPartId, setSelectedPartId] = useState('')
  const [selectedWorkstationId, setSelectedWorkstationId] = useState('')
  const [selectedMachineId, setSelectedMachineId] = useState('')
  const [selectedOperatorId, setSelectedOperatorId] = useState('')
  const [selectedMarketId, setSelectedMarketId] = useState('')

  const workflowOptions = useMemo(
    () => workflows.map(w => ({ id: w.id, label: `Workflow #${w.id}` })),
    [workflows]
  )
  const operationOptions = useMemo(
    () => operations.map(o => ({ id: o.id, label: `#${o.id} - ${o.name} (${o.duration})` })),
    [operations]
  )
  const productOptions = useMemo(
    () => products.map(p => ({ id: p.id, label: `#${p.id} - ${p.name}` })),
    [products]
  )
  const partOptions = useMemo(
    () => parts.map(p => ({ id: p.id, label: `#${p.id} - ${p.name} (wf:${p.workflow_id})` })),
    [parts]
  )

  const processOptions = useMemo(
    () => processes.map(p => ({ id: p.id, label: `#${p.id} - ${p.name}` })),
    [processes]
  )

  const workstationOptions = useMemo(
    () => workstations.map(w => ({ id: w.id, label: `#${w.id} (process:${w.process_id ?? 'null'})` })),
    [workstations]
  )

  const machineOptions = useMemo(
    () => machines.map(m => ({ id: m.id, label: `#${m.id} - ${m.name} (ws:${m.workstation_id ?? 'null'})` })),
    [machines]
  )

  const operatorOptions = useMemo(
    () => operators.map(o => ({ id: o.id, label: `#${o.id} - ${o.name}` })),
    [operators]
  )

  const marketOptions = useMemo(
    () => markets.map(m => ({ id: m.id, label: `#${m.id} (last:${m.last_process_id ?? 'null'} next:${m.next_process_id ?? 'null'})` })),
    [markets]
  )

  const selectedWorkflow = useMemo(
    () => workflows.find(w => String(w.id) === String(selectedWorkflowId)) || null,
    [workflows, selectedWorkflowId]
  )

  const selectedProduct = useMemo(
    () => products.find(p => String(p.id) === String(selectedProductId)) || null,
    [products, selectedProductId]
  )

  const navItems = useMemo(
    () => ([
      { id: 'ops', label: 'Operations' },
      { id: 'wfs', label: 'Workflows' },
      { id: 'parts', label: 'Parts' },
      { id: 'products', label: 'Products' },
      { id: 'processes', label: 'Processes' },
      { id: 'workstations', label: 'Workstations' },
      { id: 'machines', label: 'Machines' },
      { id: 'operators', label: 'Operators' },
      { id: 'markets', label: 'Markets' },
    ]),
    []
  )

  async function refreshAll() {
    setLoading(true)
    setError('')
    setOk('')

    try {
      const [ops, wfs, pts, prods, procs, wss, ms, ops2, mkts, mpqs] = await Promise.all([
        api.listOperations(),
        api.listWorkflows(),
        api.listParts(),
        api.listProducts(),
        api.listProcesses(),
        api.listWorkstations(),
        api.listMachines(),
        api.listOperators(),
        api.listMarkets(),
        api.listMarketPartQuantities(),
      ])
      setOperations(ops)
      setWorkflows(wfs)
      setParts(pts)
      setProducts(prods)
      setProcesses(procs)
      setWorkstations(wss)
      setMachines(ms)
      setOperators(ops2)
      setMarkets(mkts)
      setMarketPartQuantities(mpqs)
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
    setOk('')
    setLoading(true)
    try {
      const duration = toNumber(newOperationDuration)
      await api.createOperation({ name: newOperationName, duration })
      setNewOperationName('')
      setNewOperationDuration('')
      setOk('Operation criada')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateWorkflow() {
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.createWorkflow({})
      setOk('Workflow criado')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onAttachOperationToWorkflow(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const wfId = toNumber(selectedWorkflowId)
      const opId = toNumber(selectedOperationId)
      await api.addOperationToWorkflow(wfId, opId)
      setOk('Operation vinculada ao Workflow')
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
    setOk('')
    setLoading(true)
    try {
      const workflow_id = toNumber(newPartWorkflowId)
      await api.createPart({ name: newPartName, workflow_id })
      setNewPartName('')
      setNewPartWorkflowId('')
      setOk('Part criada')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateProduct(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.createProduct({ name: newProductName })
      setNewProductName('')
      setOk('Product criado')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onAttachPartToProduct(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const productId = toNumber(selectedProductId)
      const partId = toNumber(selectedPartId)
      await api.addPartToProduct(productId, partId)
      setOk('Part adicionada no Product')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onRemovePartFromProduct(partId) {
    if (!selectedProductId) return
    setError('')
    setOk('')
    setLoading(true)
    try {
      const productId = toNumber(selectedProductId)
      await api.removePartFromProduct(productId, partId)
      setOk('Part removida do Product')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateProcess(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.createProcess({ name: newProcessName })
      setNewProcessName('')
      setOk('Process criado')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateWorkstation(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const process_id = newWorkstationProcessId ? toNumber(newWorkstationProcessId) : null
      await api.createWorkstation({ process_id })
      setNewWorkstationProcessId('')
      setOk('Workstation criada')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onUpdateWorkstationProcess(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const wsId = toNumber(selectedWorkstationId)
      const process_id = newWorkstationProcessId ? toNumber(newWorkstationProcessId) : null
      await api.updateWorkstation(wsId, { process_id })
      setOk('Workstation atualizada')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateMachine(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.createMachine({ name: newMachineName, capacity: toNumber(newMachineCapacity) })
      setNewMachineName('')
      setNewMachineCapacity('')
      setOk('Machine criada')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onMoveMachineToWorkstation(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.moveMachineToWorkstation(toNumber(selectedMachineId), toNumber(selectedWorkstationId))
      setOk('Machine movida para Workstation')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onAddOperationToMachine(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.addOperationToMachine(toNumber(selectedMachineId), toNumber(selectedOperationId))
      setOk('Operation adicionada na Machine')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateOperator(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.createOperator({ name: newOperatorName })
      setNewOperatorName('')
      setOk('Operator criado')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onAddOperatorToWorkstation(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.addOperatorToWorkstation(toNumber(selectedWorkstationId), toNumber(selectedOperatorId))
      setOk('Operator adicionado na Workstation')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateMarket(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const last_process_id = newMarketLastProcessId ? toNumber(newMarketLastProcessId) : null
      const next_process_id = newMarketNextProcessId ? toNumber(newMarketNextProcessId) : null
      await api.createMarket({ last_process_id, next_process_id })
      setNewMarketLastProcessId('')
      setNewMarketNextProcessId('')
      setOk('Market criado')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onCreateMpq(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      await api.createMarketPartQuantity({
        market_id: toNumber(newMpqMarketId),
        part_id: toNumber(newMpqPartId),
        quantity: toNumber(newMpqQuantity),
      })
      setNewMpqMarketId('')
      setNewMpqPartId('')
      setNewMpqQuantity('')
      setOk('MarketPartQuantity criado')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onDeleteEntity(action) {
    setError('')
    setOk('')
    setLoading(true)
    try {
      await action()
      setOk('Deletado')
      await refreshAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onLoadProcessDetails() {
    if (!selectedWorkstationId) return
  }

  async function loadProcessDetails(processId) {
    setError('')
    setOk('')
    setLoading(true)
    try {
      const [wss, pts] = await Promise.all([
        api.listProcessWorkstations(processId),
        api.listProcessParts(processId),
      ])
      setProcessWorkstations(wss)
      setProcessParts(pts)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadWorkstationDetails(workstationId) {
    setError('')
    setOk('')
    setLoading(true)
    try {
      const [ms, ops] = await Promise.all([
        api.listWorkstationMachines(workstationId),
        api.listWorkstationOperators(workstationId),
      ])
      setWorkstationMachines(ms)
      setWorkstationOperators(ops)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadMachineDetails(machineId) {
    setError('')
    setOk('')
    setLoading(true)
    try {
      const [ops, ws] = await Promise.all([
        api.listMachineOperations(machineId),
        api.getMachineWorkstation(machineId),
      ])
      setMachineOperations(ops)
      setMachineWorkstation(ws)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadMarketDetails(marketId) {
    setError('')
    setOk('')
    setLoading(true)
    try {
      const demands = await api.listMarketPartDemands(marketId)
      setMarketDemands(demands)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <Nav items={navItems} />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Process Simulation</h1>
            <div className="subtitle">Painel simples pra testar rotas e relacionamentos.</div>
          </div>
          <div className="topbar-actions">
            <button onClick={refreshAll} disabled={loading}>Recarregar</button>
          </div>
        </header>

        {error ? <div className="alert error">{error}</div> : null}
        {ok ? <div className="alert ok">{ok}</div> : null}
        {loading ? <div className="muted">Carregando...</div> : null}

        <div className="grid">
          <Section id="ops" title="Operations">
          <form className="row" onSubmit={onCreateOperation}>
            <input
              value={newOperationName}
              onChange={(e) => setNewOperationName(e.target.value)}
              placeholder="Nome"
              required
            />
            <input
              value={newOperationDuration}
              onChange={(e) => setNewOperationDuration(e.target.value)}
              placeholder="Duração (ex: 1.5)"
              type="number"
              step="0.01"
              min="0"
              required
            />
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <ul className="list">
            {operations.map(op => (
              <li key={op.id} className="list-item">
                <span>#{op.id}</span>
                <span className="strong">{op.name ?? '(sem nome)'}</span>
                <span className="pill">duration: {op.duration}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="wfs" title="Workflows">
          <div className="row">
            <button onClick={onCreateWorkflow} disabled={loading}>Criar Workflow</button>
          </div>

          <form className="row" onSubmit={onAttachOperationToWorkflow}>
            <select value={selectedWorkflowId} onChange={(e) => setSelectedWorkflowId(e.target.value)} required>
              <option value="" disabled>Workflow</option>
              {workflowOptions.map(w => (
                <option key={w.id} value={String(w.id)}>{w.label}</option>
              ))}
            </select>
            <select value={selectedOperationId} onChange={(e) => setSelectedOperationId(e.target.value)} required>
              <option value="" disabled>Operation</option>
              {operationOptions.map(o => (
                <option key={o.id} value={String(o.id)}>{o.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Vincular</button>
          </form>

          {selectedWorkflow ? (
            <div className="muted">
              operations no workflow (ids): {Array.isArray(selectedWorkflow.operations) ? selectedWorkflow.operations.join(', ') : ''}
            </div>
          ) : null}

          <ul className="list">
            {workflows.map(wf => (
              <li key={wf.id} className="list-item">
                <span>#{wf.id}</span>
                <span className="strong">Workflow</span>
                <span className="pill">ops: {wf.operations?.length ?? 0}</span>
                <span className="pill">part_id: {wf.part_id ?? 'null'}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="parts" title="Parts (workflow obrigatório e 1:1)">
          <form className="row" onSubmit={onCreatePart}>
            <input
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              placeholder="Nome"
              required
            />
            <select value={newPartWorkflowId} onChange={(e) => setNewPartWorkflowId(e.target.value)} required>
              <option value="" disabled>Workflow</option>
              {workflowOptions.map(w => (
                <option key={w.id} value={String(w.id)}>{w.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <div className="muted">
            Dica: tente criar duas parts com o mesmo workflow para validar a regra 1:1 (deve dar 409).
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

        <Section id="products" title="Products (M:N com Parts)">
          <form className="row" onSubmit={onCreateProduct}>
            <input
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="Nome"
              required
            />
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <form className="row" onSubmit={onAttachPartToProduct}>
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
              <option value="" disabled>Product</option>
              {productOptions.map(p => (
                <option key={p.id} value={String(p.id)}>{p.label}</option>
              ))}
            </select>
            <select value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)} required>
              <option value="" disabled>Part</option>
              {partOptions.map(p => (
                <option key={p.id} value={String(p.id)}>{p.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Adicionar</button>
          </form>

          {selectedProduct ? (
            <div className="card">
              <div className="muted">parts do product (ids): {Array.isArray(selectedProduct.parts) ? selectedProduct.parts.join(', ') : ''}</div>
              <div className="row wrap">
                {(selectedProduct.parts || []).map((pid) => (
                  <button
                    key={pid}
                    type="button"
                    className="small danger"
                    disabled={loading}
                    onClick={() => onRemovePartFromProduct(pid)}
                  >
                    Remover part #{pid}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <ul className="list">
            {products.map(p => (
              <li key={p.id} className="list-item">
                <span>#{p.id}</span>
                <span className="strong">{p.name ?? '(sem nome)'}</span>
                <span className="pill">parts: {p.parts?.length ?? 0}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="processes" title="Processes">
          <form className="row" onSubmit={onCreateProcess}>
            <input value={newProcessName} onChange={(e) => setNewProcessName(e.target.value)} placeholder="Nome" required />
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <ul className="list">
            {processes.map(p => (
              <li key={p.id} className="list-item">
                <span>#{p.id}</span>
                <span className="strong">{p.name}</span>
                <span className="pill">workstations: {p.workstations?.length ?? 0}</span>
                <span className="pill">parts: {p.parts?.length ?? 0}</span>
                <div className="row">
                  <button type="button" className="small" disabled={loading} onClick={() => loadProcessDetails(p.id)}>Detalhes</button>
                  <button type="button" className="small danger" disabled={loading} onClick={() => onDeleteEntity(() => api.deleteProcess(p.id))}>Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="card">
            <div className="muted">Detalhes do process (via endpoints /processes/&lt;id&gt;/...)</div>
            <div className="muted">Workstations: {processWorkstations.map(w => `#${w.id}`).join(', ') || '-'}</div>
            <div className="muted">Parts: {processParts.map(p => `#${p.id}`).join(', ') || '-'}</div>
          </div>
        </Section>

  <Section id="workstations" title="Workstations">
          <form className="row" onSubmit={onCreateWorkstation}>
            <select value={newWorkstationProcessId} onChange={(e) => setNewWorkstationProcessId(e.target.value)}>
              <option value="">(sem process)</option>
              {processOptions.map(p => (
                <option key={p.id} value={String(p.id)}>{p.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Criar Workstation</button>
          </form>

          <form className="row" onSubmit={onUpdateWorkstationProcess}>
            <select value={selectedWorkstationId} onChange={(e) => setSelectedWorkstationId(e.target.value)} required>
              <option value="" disabled>Workstation</option>
              {workstationOptions.map(w => (
                <option key={w.id} value={String(w.id)}>{w.label}</option>
              ))}
            </select>
            <select value={newWorkstationProcessId} onChange={(e) => setNewWorkstationProcessId(e.target.value)}>
              <option value="">(sem process)</option>
              {processOptions.map(p => (
                <option key={p.id} value={String(p.id)}>{p.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Atualizar process</button>
          </form>

          <form className="row" onSubmit={onAddOperatorToWorkstation}>
            <select value={selectedWorkstationId} onChange={(e) => setSelectedWorkstationId(e.target.value)} required>
              <option value="" disabled>Workstation</option>
              {workstationOptions.map(w => (
                <option key={w.id} value={String(w.id)}>{w.label}</option>
              ))}
            </select>
            <select value={selectedOperatorId} onChange={(e) => setSelectedOperatorId(e.target.value)} required>
              <option value="" disabled>Operator</option>
              {operatorOptions.map(o => (
                <option key={o.id} value={String(o.id)}>{o.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Add operator</button>
          </form>

          <ul className="list">
            {workstations.map(w => (
              <li key={w.id} className="list-item">
                <span>#{w.id}</span>
                <span className="strong">Workstation</span>
                <span className="pill">process_id: {w.process_id ?? 'null'}</span>
                <span className="pill">machines: {w.machines?.length ?? 0}</span>
                <span className="pill">operators: {w.operators?.length ?? 0}</span>
                <div className="row">
                  <button type="button" className="small" disabled={loading} onClick={() => loadWorkstationDetails(w.id)}>Detalhes</button>
                  <button type="button" className="small danger" disabled={loading} onClick={() => onDeleteEntity(() => api.deleteWorkstation(w.id))}>Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="card">
            <div className="muted">Detalhes da workstation (via endpoints /workstations/&lt;id&gt;/...)</div>
            <div className="muted">Machines: {workstationMachines.map(m => `#${m.id}`).join(', ') || '-'}</div>
            <div className="muted">Operators: {workstationOperators.map(o => `#${o.id}`).join(', ') || '-'}</div>
          </div>
        </Section>

  <Section id="machines" title="Machines">
          <form className="row" onSubmit={onCreateMachine}>
            <input value={newMachineName} onChange={(e) => setNewMachineName(e.target.value)} placeholder="Nome" required />
            <input value={newMachineCapacity} onChange={(e) => setNewMachineCapacity(e.target.value)} placeholder="Capacity" type="number" min="0" required />
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <form className="row" onSubmit={onMoveMachineToWorkstation}>
            <select value={selectedMachineId} onChange={(e) => setSelectedMachineId(e.target.value)} required>
              <option value="" disabled>Machine</option>
              {machineOptions.map(m => (
                <option key={m.id} value={String(m.id)}>{m.label}</option>
              ))}
            </select>
            <select value={selectedWorkstationId} onChange={(e) => setSelectedWorkstationId(e.target.value)} required>
              <option value="" disabled>Workstation</option>
              {workstationOptions.map(w => (
                <option key={w.id} value={String(w.id)}>{w.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Mover</button>
          </form>

          <form className="row" onSubmit={onAddOperationToMachine}>
            <select value={selectedMachineId} onChange={(e) => setSelectedMachineId(e.target.value)} required>
              <option value="" disabled>Machine</option>
              {machineOptions.map(m => (
                <option key={m.id} value={String(m.id)}>{m.label}</option>
              ))}
            </select>
            <select value={selectedOperationId} onChange={(e) => setSelectedOperationId(e.target.value)} required>
              <option value="" disabled>Operation</option>
              {operationOptions.map(o => (
                <option key={o.id} value={String(o.id)}>{o.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Add operation</button>
          </form>

          <ul className="list">
            {machines.map(m => (
              <li key={m.id} className="list-item">
                <span>#{m.id}</span>
                <span className="strong">{m.name}</span>
                <span className="pill">capacity: {m.capacity}</span>
                <span className="pill">ws: {m.workstation_id ?? 'null'}</span>
                <span className="pill">ops: {m.operations?.length ?? 0}</span>
                <div className="row">
                  <button type="button" className="small" disabled={loading} onClick={() => loadMachineDetails(m.id)}>Detalhes</button>
                  <button type="button" className="small danger" disabled={loading} onClick={() => onDeleteEntity(() => api.deleteMachine(m.id))}>Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="card">
            <div className="muted">Detalhes da machine</div>
            <div className="muted">Workstation: {machineWorkstation ? `#${machineWorkstation.id}` : '-'}</div>
            <div className="muted">Operations: {machineOperations.map(o => `#${o.id}`).join(', ') || '-'}</div>
          </div>
        </Section>

  <Section id="operators" title="Operators">
          <form className="row" onSubmit={onCreateOperator}>
            <input value={newOperatorName} onChange={(e) => setNewOperatorName(e.target.value)} placeholder="Nome" required />
            <button type="submit" disabled={loading}>Criar</button>
          </form>

          <ul className="list">
            {operators.map(o => (
              <li key={o.id} className="list-item">
                <span>#{o.id}</span>
                <span className="strong">{o.name}</span>
                <button type="button" className="small danger" disabled={loading} onClick={() => onDeleteEntity(() => api.deleteOperator(o.id))}>Delete</button>
              </li>
            ))}
          </ul>
        </Section>

  <Section id="markets" title="Markets + Demanda (MPQ)">
          <form className="row" onSubmit={onCreateMarket}>
            <select value={newMarketLastProcessId} onChange={(e) => setNewMarketLastProcessId(e.target.value)}>
              <option value="">last_process (opcional)</option>
              {processOptions.map(p => (
                <option key={p.id} value={String(p.id)}>{p.label}</option>
              ))}
            </select>
            <select value={newMarketNextProcessId} onChange={(e) => setNewMarketNextProcessId(e.target.value)}>
              <option value="">next_process (opcional)</option>
              {processOptions.map(p => (
                <option key={p.id} value={String(p.id)}>{p.label}</option>
              ))}
            </select>
            <button type="submit" disabled={loading}>Criar Market</button>
          </form>

          <form className="row" onSubmit={onCreateMpq}>
            <select value={newMpqMarketId} onChange={(e) => setNewMpqMarketId(e.target.value)} required>
              <option value="" disabled>Market</option>
              {marketOptions.map(m => (
                <option key={m.id} value={String(m.id)}>{m.label}</option>
              ))}
            </select>
            <select value={newMpqPartId} onChange={(e) => setNewMpqPartId(e.target.value)} required>
              <option value="" disabled>Part</option>
              {partOptions.map(p => (
                <option key={p.id} value={String(p.id)}>{p.label}</option>
              ))}
            </select>
            <input value={newMpqQuantity} onChange={(e) => setNewMpqQuantity(e.target.value)} placeholder="Quantity" type="number" min="0" required />
            <button type="submit" disabled={loading}>Add/Update demand</button>
          </form>

          <div className="row">
            <select value={selectedMarketId} onChange={(e) => setSelectedMarketId(e.target.value)}>
              <option value="">Market (para detalhes)</option>
              {marketOptions.map(m => (
                <option key={m.id} value={String(m.id)}>{m.label}</option>
              ))}
            </select>
            <button type="button" className="small" disabled={loading || !selectedMarketId} onClick={() => loadMarketDetails(toNumber(selectedMarketId))}>Ver demandas</button>
            <button type="button" className="small danger" disabled={loading || !selectedMarketId} onClick={() => onDeleteEntity(() => api.deleteMarket(toNumber(selectedMarketId)))}>Delete market</button>
          </div>

          <ul className="list">
            {markets.map(m => (
              <li key={m.id} className="list-item">
                <span>#{m.id}</span>
                <span className="strong">Market</span>
                <span className="pill">last: {m.last_process_id ?? 'null'}</span>
                <span className="pill">next: {m.next_process_id ?? 'null'}</span>
                <span className="pill">parts: {m.parts?.length ?? 0}</span>
              </li>
            ))}
          </ul>

          <div className="card">
            <div className="muted">Demanda por part (GET /markets/&lt;id&gt;/part-demands)</div>
            <pre className="pre">{marketDemands ? JSON.stringify(marketDemands, null, 2) : 'Selecione um market e clique em “Ver demandas”'}</pre>
          </div>

          <div className="muted">MarketPartQuantities (market_id + part_id + quantity)</div>
          <ul className="list">
            {marketPartQuantities.map((mpq, idx) => (
              <li key={idx} className="list-item">
                <span className="strong">market: {mpq.market_id} | part: {mpq.part_id}</span>
                <span className="pill">qty: {mpq.quantity}</span>
              </li>
            ))}
          </ul>
        </Section>
        </div>

        <footer className="footer">
          <span className="muted">Dica: use os botões “Detalhes” pra validar endpoints específicos.</span>
        </footer>
      </main>
    </div>
  )
}