import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import { api } from './services/api'

import CadastrosPage from './pages/CadastrosPage'
import TabelasPage from './pages/TabelasPage'
import SimulationPage from './pages/SimulationPage'

function NavLinkItem({ to, label }) {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link className={active ? 'nav-link active' : 'nav-link'} to={to}>
      {label}
    </Link>
  )
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

  const navItems = useMemo(
    () => [
      { to: '/cadastros', label: 'Cadastros' },
      { to: '/tabelas', label: 'Tabelas' },
      { to: '/simulacao', label: 'Simulação' },
    ],
    []
  )

  async function refreshAll() {
    setLoading(true)
    setError('')
    setOk('')

    try {
      const [
        ops,
        wfs,
        pts,
        prods,
        procs,
        wss,
        ms,
        ops2,
        mkts,
        mpqs,
      ] = await Promise.all([
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
      setOk('Dados atualizados.')
    } catch (e) {
      setError(e?.message || String(e) || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="nav-title">Process Simulation</div>

        <nav className="nav">
          {navItems.map((it) => (
            <NavLinkItem key={it.to} to={it.to} label={it.label} />
          ))}
        </nav>

        <div className="nav-footer">
          <button className="btn" onClick={refreshAll} disabled={loading}>
            {loading ? 'Atualizando…' : 'Atualizar dados'}
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            {error ? <div className="alert error">{error}</div> : null}
            {ok ? <div className="alert ok">{ok}</div> : null}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/cadastros" replace />} />

          <Route
            path="/cadastros"
            element={(
              <CadastrosPage
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
                ok={ok}
                setOk={setOk}
                operations={operations}
                setOperations={setOperations}
                workflows={workflows}
                setWorkflows={setWorkflows}
                parts={parts}
                setParts={setParts}
                products={products}
                setProducts={setProducts}
                processes={processes}
                setProcesses={setProcesses}
                workstations={workstations}
                setWorkstations={setWorkstations}
                machines={machines}
                setMachines={setMachines}
                operators={operators}
                setOperators={setOperators}
                markets={markets}
                setMarkets={setMarkets}
                marketPartQuantities={marketPartQuantities}
                setMarketPartQuantities={setMarketPartQuantities}
              />
            )}
          />

          <Route
            path="/tabelas"
            element={(
              <TabelasPage
                operations={operations}
                workflows={workflows}
                parts={parts}
                products={products}
                processes={processes}
                workstations={workstations}
                machines={machines}
                operators={operators}
                markets={markets}
                marketPartQuantities={marketPartQuantities}
              />
            )}
          />

          <Route path="/simulacao" element={<SimulationPage products={products} parts={parts} machines={machines} />} />
          <Route path="*" element={<Navigate to="/cadastros" replace />} />
        </Routes>
      </main>
    </div>
  )
}
