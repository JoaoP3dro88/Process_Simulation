import Simulation from '../Simulation'

export default function SimulationPage({ products, parts, machines }) {
  return (
    <Simulation
      onBack={null}
      products={products}
      parts={parts}
      machines={machines}
    />
  )
}
