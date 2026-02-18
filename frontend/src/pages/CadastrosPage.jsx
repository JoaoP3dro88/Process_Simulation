import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

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

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

export default function CadastrosPage({
  loading,
  setLoading,
  error,
  setError,
  ok,
  setOk,
  operations,
  setOperations,
  workflows,
  setWorkflows,
  parts,
  setParts,
  products,
  setProducts,
  processes,
  setProcesses,
  workstations,
  setWorkstations,
  machines,
  setMachines,
  operators,
  setOperators,
  markets,
  setMarkets,
  marketPartQuantities,
  setMarketPartQuantities,
}) {
  // create forms
  const [newOperationName, setNewOperationName] = useState('')
  const [newOperationDuration, setNewOperationDuration] = useState('')
  const [newWorkflowName, setNewWorkflowName] = useState('')
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

  // assignments
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')
  const [selectedOperationId, setSelectedOperationId] = useState('')
  const [workflowOpSequence, setWorkflowOpSequence] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedPartId, setSelectedPartId] = useState('')

  const workflowOptions = useMemo(
    () => workflows.map(w => ({ id: w.id, label: `#${w.id} - ${w.name ?? 'Workflow'}` })),
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
  const marketOptions = useMemo(
    () => markets.map(m => ({ id: m.id, label: `#${m.id}` })),
    [markets]
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
    // if user hits refresh on /cadastros route and parent state is empty, reload
    if (operations.length === 0 && workflows.length === 0 && parts.length === 0) {
      refreshAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onCreateOperation(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const duration = toNumber(newOperationDuration)
      if (!newOperationName.trim()) throw new Error('Informe o nome da operação')
      if (!Number.isFinite(duration)) throw new Error('Duração inválida')

      await api.createOperation({ name: newOperationName.trim(), duration })
      setOk('Operação criada')
      setNewOperationName('')
      setNewOperationDuration('')
      setOperations(await api.listOperations())
    } catch (e) {
      setError(e.message || 'Falha ao criar operação')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateWorkflow(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      if (!newWorkflowName.trim()) throw new Error('Informe o nome do workflow')
      await api.createWorkflow({ name: newWorkflowName.trim() })
      setOk('Workflow criado')
      setNewWorkflowName('')
      setWorkflows(await api.listWorkflows())
    } catch (e) {
      setError(e.message || 'Falha ao criar workflow')
    } finally {
      setLoading(false)
    }
  }

  async function onCreatePart(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const workflowId = toNumber(newPartWorkflowId)
      if (!newPartName.trim()) throw new Error('Informe o nome da peça')
      if (!Number.isFinite(workflowId)) throw new Error('Selecione um workflow')

      await api.createPart({ name: newPartName.trim(), workflow_id: workflowId })
      setOk('Peça criada')
      setNewPartName('')
      setNewPartWorkflowId('')
      setParts(await api.listParts())
    } catch (e) {
      setError(e.message || 'Falha ao criar peça')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateProduct(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      if (!newProductName.trim()) throw new Error('Informe o nome do produto')
      await api.createProduct({ name: newProductName.trim() })
      setOk('Produto criado')
      setNewProductName('')
      setProducts(await api.listProducts())
    } catch (e) {
      setError(e.message || 'Falha ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateProcess(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      if (!newProcessName.trim()) throw new Error('Informe o nome do processo')
      await api.createProcess({ name: newProcessName.trim() })
      setOk('Processo criado')
      setNewProcessName('')
      setProcesses(await api.listProcesses())
    } catch (e) {
      setError(e.message || 'Falha ao criar processo')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateWorkstation(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const processId = toNumber(newWorkstationProcessId)
      if (!Number.isFinite(processId)) throw new Error('Selecione um processo')

      await api.createWorkstation({ process_id: processId })
      setOk('Workstation criada')
      setNewWorkstationProcessId('')
      setWorkstations(await api.listWorkstations())
    } catch (e) {
      setError(e.message || 'Falha ao criar workstation')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateMachine(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const capacity = toNumber(newMachineCapacity)
      if (!newMachineName.trim()) throw new Error('Informe o nome da máquina')
      if (!Number.isFinite(capacity)) throw new Error('Capacidade inválida')

      await api.createMachine({ name: newMachineName.trim(), capacity })
      setOk('Máquina criada')
      setNewMachineName('')
      setNewMachineCapacity('')
      setMachines(await api.listMachines())
    } catch (e) {
      setError(e.message || 'Falha ao criar máquina')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateOperator(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      if (!newOperatorName.trim()) throw new Error('Informe o nome do operador')
      await api.createOperator({ name: newOperatorName.trim() })
      setOk('Operador criado')
      setNewOperatorName('')
      setOperators(await api.listOperators())
    } catch (e) {
      setError(e.message || 'Falha ao criar operador')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateMarket(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const last_process_id = newMarketLastProcessId ? toNumber(newMarketLastProcessId) : null
      const next_process_id = newMarketNextProcessId ? toNumber(newMarketNextProcessId) : null

      await api.createMarket({ last_process_id, next_process_id })
      setOk('Market criado')
      setNewMarketLastProcessId('')
      setNewMarketNextProcessId('')
      setMarkets(await api.listMarkets())
    } catch (e) {
      setError(e.message || 'Falha ao criar market')
    } finally {
      setLoading(false)
    }
  }

  async function onCreateMarketPartQuantity(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const market_id = toNumber(newMpqMarketId)
      const part_id = toNumber(newMpqPartId)
      const quantity = toNumber(newMpqQuantity)

      if (!Number.isFinite(market_id)) throw new Error('Selecione um market')
      if (!Number.isFinite(part_id)) throw new Error('Selecione uma peça')
      if (!Number.isFinite(quantity)) throw new Error('Quantidade inválida')

      await api.createMarketPartQuantity({ market_id, part_id, quantity })
      setOk('Demanda criada (market-part-quantity)')
      setNewMpqMarketId('')
      setNewMpqPartId('')
      setNewMpqQuantity('')
      setMarketPartQuantities(await api.listMarketPartQuantities())
    } catch (e) {
      setError(e.message || 'Falha ao criar demanda')
    } finally {
      setLoading(false)
    }
  }

  async function onAddOperationToWorkflow(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const workflowId = toNumber(selectedWorkflowId)
      const operationId = toNumber(selectedOperationId)
      const sequence = workflowOpSequence ? toNumber(workflowOpSequence) : undefined

      if (!Number.isFinite(workflowId)) throw new Error('Selecione um workflow')
      if (!Number.isFinite(operationId)) throw new Error('Selecione uma operação')

      if (sequence !== undefined && !Number.isFinite(sequence)) throw new Error('Sequência inválida')

      if (sequence !== undefined) {
        await api.addOperationToWorkflowWithSequence(workflowId, operationId, sequence)
      } else {
        await api.addOperationToWorkflow(workflowId, operationId)
      }

      setOk('Operação vinculada ao workflow')
      setSelectedOperationId('')
      setWorkflowOpSequence('')
    } catch (e) {
      setError(e.message || 'Falha ao vincular operação ao workflow')
    } finally {
      setLoading(false)
    }
  }

  async function onAddPartToProduct(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk('')
    try {
      const productId = toNumber(selectedProductId)
      const partId = toNumber(selectedPartId)
      if (!Number.isFinite(productId)) throw new Error('Selecione um produto')
      if (!Number.isFinite(partId)) throw new Error('Selecione uma peça')

      await api.addPartToProduct(productId, partId)
      setOk('Peça adicionada ao produto')
      setSelectedPartId('')
    } catch (e) {
      setError(e.message || 'Falha ao adicionar peça ao produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid">
      {error ? <div className="alert error">{error}</div> : null}
      {ok ? <div className="alert ok">{ok}</div> : null}

      <Section title="Atualizar dados">
        <div className="row">
          <button className="btn" onClick={refreshAll} disabled={loading}>Recarregar</button>
        </div>
      </Section>

      <Section title="Operações">
        <form className="card" onSubmit={onCreateOperation}>
          <div className="row">
            <label className="field">
              <span className="label">Nome</span>
              <input value={newOperationName} onChange={(e) => setNewOperationName(e.target.value)} />
            </label>
            <label className="field">
              <span className="label">Duração</span>
              <input value={newOperationDuration} onChange={(e) => setNewOperationDuration(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Workflows">
        <form className="card" onSubmit={onCreateWorkflow}>
          <div className="row">
            <label className="field">
              <span className="label">Nome</span>
              <input value={newWorkflowName} onChange={(e) => setNewWorkflowName(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>

        <form className="card" onSubmit={onAddOperationToWorkflow}>
          <div className="row">
            <label className="field">
              <span className="label">Workflow</span>
              <select value={selectedWorkflowId} onChange={(e) => setSelectedWorkflowId(e.target.value)}>
                <option value="">Selecione…</option>
                {workflowOptions.map(w => (
                  <option key={w.id} value={w.id}>{w.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Operação</span>
              <select value={selectedOperationId} onChange={(e) => setSelectedOperationId(e.target.value)}>
                <option value="">Selecione…</option>
                {operationOptions.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Sequência (opcional)</span>
              <input value={workflowOpSequence} onChange={(e) => setWorkflowOpSequence(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Vincular</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Peças">
        <form className="card" onSubmit={onCreatePart}>
          <div className="row">
            <label className="field">
              <span className="label">Nome</span>
              <input value={newPartName} onChange={(e) => setNewPartName(e.target.value)} />
            </label>
            <label className="field">
              <span className="label">Workflow</span>
              <select value={newPartWorkflowId} onChange={(e) => setNewPartWorkflowId(e.target.value)}>
                <option value="">Selecione…</option>
                {workflowOptions.map(w => (
                  <option key={w.id} value={w.id}>{w.label}</option>
                ))}
              </select>
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Produtos">
        <form className="card" onSubmit={onCreateProduct}>
          <div className="row">
            <label className="field">
              <span className="label">Nome</span>
              <input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>

        <form className="card" onSubmit={onAddPartToProduct}>
          <div className="row">
            <label className="field">
              <span className="label">Produto</span>
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                <option value="">Selecione…</option>
                {productOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Peça</span>
              <select value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)}>
                <option value="">Selecione…</option>
                {partOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Adicionar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Processos">
        <form className="card" onSubmit={onCreateProcess}>
          <div className="row">
            <label className="field">
              <span className="label">Nome</span>
              <input value={newProcessName} onChange={(e) => setNewProcessName(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Workstations">
        <form className="card" onSubmit={onCreateWorkstation}>
          <div className="row">
            <label className="field">
              <span className="label">Processo</span>
              <select value={newWorkstationProcessId} onChange={(e) => setNewWorkstationProcessId(e.target.value)}>
                <option value="">Selecione…</option>
                {processOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Máquinas">
        <form className="card" onSubmit={onCreateMachine}>
          <div className="row">
            <label className="field">
              <span className="label">Nome</span>
              <input value={newMachineName} onChange={(e) => setNewMachineName(e.target.value)} />
            </label>
            <label className="field">
              <span className="label">Capacidade</span>
              <input value={newMachineCapacity} onChange={(e) => setNewMachineCapacity(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Operadores">
        <form className="card" onSubmit={onCreateOperator}>
          <div className="row">
            <label className="field">
              <span className="label">Nome</span>
              <input value={newOperatorName} onChange={(e) => setNewOperatorName(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Markets">
        <form className="card" onSubmit={onCreateMarket}>
          <div className="row">
            <label className="field">
              <span className="label">Last process (opcional)</span>
              <select value={newMarketLastProcessId} onChange={(e) => setNewMarketLastProcessId(e.target.value)}>
                <option value="">(vazio)</option>
                {processOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Next process (opcional)</span>
              <select value={newMarketNextProcessId} onChange={(e) => setNewMarketNextProcessId(e.target.value)}>
                <option value="">(vazio)</option>
                {processOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Demanda (Market-Part-Quantity)">
        <form className="card" onSubmit={onCreateMarketPartQuantity}>
          <div className="row">
            <label className="field">
              <span className="label">Market</span>
              <select value={newMpqMarketId} onChange={(e) => setNewMpqMarketId(e.target.value)}>
                <option value="">Selecione…</option>
                {marketOptions.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Peça</span>
              <select value={newMpqPartId} onChange={(e) => setNewMpqPartId(e.target.value)}>
                <option value="">Selecione…</option>
                {partOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Quantidade</span>
              <input value={newMpqQuantity} onChange={(e) => setNewMpqQuantity(e.target.value)} />
            </label>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button className="btn" type="submit" disabled={loading}>Criar</button>
            </div>
          </div>
        </form>
      </Section>

      <div className="footer muted">
        Dica: a tela de “Tabelas” mostra os registros do banco. Aqui é focado em criar/vincular.
      </div>
    </div>
  )
}
