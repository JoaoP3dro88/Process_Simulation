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
  // operations
  listOperations: () => request('/operations'),
  createOperation: (payload) => request('/operations', { method: 'POST', body: JSON.stringify(payload) }),

  // workflows
  listWorkflows: () => request('/workflows'),
  createWorkflow: (payload) => request('/workflows', { method: 'POST', body: JSON.stringify(payload) }),
  listWorkflowOperations: (workflowId) => request(`/workflows/${workflowId}/operations`),
  addOperationToWorkflow: (workflowId, operationId) =>
    request(`/workflows/${workflowId}/operations`, { method: 'POST', body: JSON.stringify({ operation_id: operationId }) }),

  // parts (workflow obrigatório no seu backend)
  listParts: () => request('/parts'),
  createPart: (payload) => request('/parts', { method: 'POST', body: JSON.stringify(payload) }),
}