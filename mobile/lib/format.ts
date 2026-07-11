export function formatPrice(amount: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Group availability slots by YYYY-MM-DD for the booking calendar. */
export function slotDayLabel(iso: string) {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString('en', { weekday: 'short' }),
    day: d.getDate(),
    time: d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
  };
}
