/** e.g. general → General, in_progress → In Progress */
export function titleCaseLabel(value) {
  if (value == null || value === '') return ''
  return String(value)
    .replace(/_/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function statusTagClass(status) {
  const map = {
    open: 'ticket-tag-status--open',
    in_progress: 'ticket-tag-status--in-progress',
    resolved: 'ticket-tag-status--resolved',
    closed: 'ticket-tag-status--closed',
  }
  return map[status] || ''
}

export function priorityTagClass(priority) {
  if (priority === 'medium') return 'ticket-tag-priority--amber'
  if (priority === 'high') return 'ticket-tag-priority--orange'
  return ''
}

export function getPrioritySeverity(priority) {
  const map = {
    low: 'secondary',
    medium: 'secondary',
    high: 'secondary',
    critical: 'danger',
  }
  return map[priority] || 'secondary'
}
