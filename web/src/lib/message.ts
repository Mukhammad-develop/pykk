import { formatLongDate } from './format'

export interface ClientMessageVars {
  ownerName: string | null
  businessName: string
  reference: string
  amountPence: number
  dueDate: string // ISO date
  payUrl: string
}

// Builds the WhatsApp/SMS-ready text from the template in settings.
// Note: the template carries the £ itself ("£{amount}"), so {amount} is plain.
export function buildClientMessage(template: string, vars: ClientMessageVars): string {
  return template
    .split('{owner_name}').join(vars.ownerName || 'there')
    .split('{business_name}').join(vars.businessName)
    .split('{reference}').join(vars.reference)
    .split('{amount}').join((vars.amountPence / 100).toFixed(2))
    .split('{due_date_long}').join(formatLongDate(vars.dueDate))
    .split('{client_pay_url}').join(vars.payUrl)
}
