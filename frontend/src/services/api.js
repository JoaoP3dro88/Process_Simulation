async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  // tenta ler json mesmo em erro
  const text = await res.text()
  const data = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null

  if (!res.ok) {
    const message = typeof data === 'string' ? data : (data?.error || data?.message || 'Request failed')
    throw new Error(message)
  }

  return data
}

export const api = {
  // simulation
  createSimulationOrder: (payload) => request('/simulation/orders', { method: 'POST', body: JSON.stringify(payload) }),
  listSimulationOrders: () => request('/simulation/orders'),
  listSimulationJobs: (orderId) => request(`/simulation/orders/${orderId}/jobs`),
  viewSimulationMachines: (orderId) => request(`/simulation/orders/${orderId}/machines`),
  startSimulationMachine: (orderId, machineId, payload = {}) =>
    request(`/simulation/orders/${orderId}/machines/${machineId}/start`, { method: 'POST', body: JSON.stringify(payload) }),
  finishSimulationJob: (orderId, jobId) =>
    request(`/simulation/orders/${orderId}/jobs/${jobId}/finish`, { method: 'POST', body: JSON.stringify({}) }),

  // operations
  listOperations: () => request('/operations'),
  createOperation: (payload) => request('/operations', { method: 'POST', body: JSON.stringify(payload) }),

  // workflows
  listWorkflows: () => request('/workflows'),
  createWorkflow: (payload) => request('/workflows', { method: 'POST', body: JSON.stringify(payload) }),
  listWorkflowOperations: (workflowId) => request(`/workflows/${workflowId}/operations`),
  addOperationToWorkflow: (workflowId, operationId) =>
    request(`/workflows/${workflowId}/operations`, { method: 'POST', body: JSON.stringify({ operation_id: operationId }) }),

  addOperationToWorkflowWithSequence: (workflowId, operationId, sequence) =>
    request(`/workflows/${workflowId}/operations`, {
      method: 'POST',
      body: JSON.stringify({ operation_id: operationId, sequence }),
    }),

  // parts (workflow obrigatório no seu backend)
  listParts: () => request('/parts'),
  createPart: (payload) => request('/parts', { method: 'POST', body: JSON.stringify(payload) }),

  // products
  listProducts: () => request('/products'),
  createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  addPartToProduct: (productId, partId) =>
    request(`/products/${productId}/parts`, { method: 'POST', body: JSON.stringify({ part_id: partId }) }),
  removePartFromProduct: (productId, partId) =>
    request(`/products/${productId}/parts/${partId}`, { method: 'DELETE' }),

  // processes
  listProcesses: () => request('/processes'),
  createProcess: (payload) => request('/processes', { method: 'POST', body: JSON.stringify(payload) }),
  deleteProcess: (id) => request(`/processes/${id}`, { method: 'DELETE' }),
  listProcessWorkstations: (processId) => request(`/processes/${processId}/workstations`),
  listProcessParts: (processId) => request(`/processes/${processId}/parts`),

  // workstations
  listWorkstations: () => request('/workstations'),
  createWorkstation: (payload) => request('/workstations', { method: 'POST', body: JSON.stringify(payload) }),
  updateWorkstation: (id, payload) => request(`/workstations/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteWorkstation: (id) => request(`/workstations/${id}`, { method: 'DELETE' }),
  listWorkstationMachines: (id) => request(`/workstations/${id}/machines`),
  listWorkstationOperators: (id) => request(`/workstations/${id}/operators`),
  addOperatorToWorkstation: (id, operatorId) =>
    request(`/workstations/${id}/operators`, { method: 'POST', body: JSON.stringify({ operator_id: operatorId }) }),
  removeOperatorFromWorkstation: (id, operatorId) => request(`/workstations/${id}/operators/${operatorId}`, { method: 'DELETE' }),

  // machines
  listMachines: () => request('/machines'),
  createMachine: (payload) => request('/machines', { method: 'POST', body: JSON.stringify(payload) }),
  deleteMachine: (id) => request(`/machines/${id}`, { method: 'DELETE' }),
  listMachineOperations: (id) => request(`/machines/${id}/operations`),
  getMachineWorkstation: (id) => request(`/machines/${id}/workstation`),
  addOperationToMachine: (id, operationId) =>
    request(`/machines/${id}/operations`, { method: 'POST', body: JSON.stringify({ operation_id: operationId }) }),
  removeOperationFromMachine: (id, operationId) => request(`/machines/${id}/operations/${operationId}`, { method: 'DELETE' }),
  moveMachineToWorkstation: (id, workstationId) =>
    request(`/machines/${id}/workstation`, { method: 'PUT', body: JSON.stringify({ workstation_id: workstationId }) }),

  // operators
  listOperators: () => request('/operators'),
  createOperator: (payload) => request('/operators', { method: 'POST', body: JSON.stringify(payload) }),
  deleteOperator: (id) => request(`/operators/${id}`, { method: 'DELETE' }),
  listOperatorWorkstations: (id) => request(`/operators/${id}/workstations`),

  // markets
  listMarkets: () => request('/markets'),
  createMarket: (payload) => request('/markets', { method: 'POST', body: JSON.stringify(payload) }),
  updateMarket: (id, payload) => request(`/markets/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMarket: (id) => request(`/markets/${id}`, { method: 'DELETE' }),
  listMarketPartDemands: (id) => request(`/markets/${id}/part-demands`),
  updateMarketLastProcess: (id, lastProcessId) =>
    request(`/markets/${id}/last-process`, { method: 'PUT', body: JSON.stringify({ last_process_id: lastProcessId }) }),
  updateMarketNextProcess: (id, nextProcessId) =>
    request(`/markets/${id}/next-process`, { method: 'PUT', body: JSON.stringify({ next_process_id: nextProcessId }) }),

  // market-part-quantities
  listMarketPartQuantities: () => request('/market-part-quantities'),
  createMarketPartQuantity: (payload) => request('/market-part-quantities', { method: 'POST', body: JSON.stringify(payload) }),
}