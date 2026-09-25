// Display helpers: UK long dates and £ amounts.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// 1st, 2nd, 3rd, 4th … 11th, 12th, 13th … 21st, 22nd, 23rd, 31st.
export function ordinal(day: number): string {
  const teens = day % 100
  if (teens >= 11 && teens <= 13) return `${day}th`
  switch (day % 10) {
    case 1: return `${day}st`
    case 2: return `${day}nd`
    case 3: return `${day}rd`
    default: return `${day}th`
  }
}

// '2026-10-02' → '2nd October 2026'
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${ordinal(d)} ${MONTHS[m - 1]} ${y}`
}

// 499 → '£4.99'
export function formatMoneyPence(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100)
}
