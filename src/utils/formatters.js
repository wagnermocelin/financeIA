export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`
}

export const getStatusColor = (status) => {
  const colors = {
    completed: 'text-green-600 bg-green-50',
    pending: 'text-yellow-600 bg-yellow-50',
    cancelled: 'text-red-600 bg-red-50',
    ok: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    exceeded: 'text-red-600 bg-red-50',
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}

export const getStatusLabel = (status) => {
  const labels = {
    completed: 'Concluído',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    ok: 'Normal',
    warning: 'Atenção',
    exceeded: 'Excedido',
  }
  return labels[status] || status
}
