import Link from 'next/link'
import { getTodayData, type PaymentRow } from '@/lib/today'
import { diffDays, todayLondon } from '@/lib/billing'
import { formatLongDate, formatMoneyPence } from '@/lib/format'
import { getSetting } from '@/lib/settings'
import { buildClientMessage } from '@/lib/message'
import { clientPayUrl } from '@/lib/pay-url'
import { LinkSaveForm } from './components/link-save-form'
import { CopyMessageButton } from './components/copy-message-button'
import { PaymentActions } from './components/payment-actions'
import { SuspendBusinessButton } from './components/suspend-business-button'
import { RunJobButton } from './run-job-button'

export const dynamic = 'force-dynamic'

function daysLabel(today: string, dueDate: string): string {
  const days = diffDays(today, dueDate)
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  return `in ${days} days`
}

function Card({
  label,
  count,
  total,
  extra,
  tone = 'default',
}: {
  label: string
  count?: number
  total: string
  extra?: string
  tone?: 'default' | 'red' | 'green'
}) {
  const tones = {
    default: 'border-slate-800 bg-slate-900',
    red: 'border-red-900 bg-red-950/60',
    green: 'border-emerald-900 bg-emerald-950/60',
  }
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-100">
        {count !== undefined && <>{count} <span className="text-sm font-normal text-slate-400">· </span></>}
        {total}
      </p>
      {extra && <p className="mt-0.5 text-xs text-slate-400">{extra}</p>}
    </div>
  )
}

function PaymentCard({
  payment,
  today,
  template,
  children,
}: {
  payment: PaymentRow
  today: string
  template: string
  children: React.ReactNode
}) {
  const message = buildClientMessage(template, {
    ownerName: payment.ownerName,
    businessName: payment.businessName,
    reference: payment.reference,
    amountPence: payment.amountPence,
    dueDate: payment.dueDate,
    payUrl: clientPayUrl(payment.reference, payment.clientToken),
  })
  const overdueDays = diffDays(payment.dueDate, today)

  return (
    <li className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/businesses/${payment.businessId}`} className="font-semibold text-slate-100 hover:text-emerald-400">
            {payment.businessName}
          </Link>
          <span className="ml-2 text-sm text-slate-500">#{payment.reference}</span>
        </div>
        <p className="text-sm font-semibold text-slate-100">{formatMoneyPence(payment.amountPence)}</p>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        due {formatLongDate(payment.dueDate)}
        {payment.status !== 'overdue' && <span className="text-slate-500"> ({daysLabel(today, payment.dueDate)})</span>}
        {payment.status === 'overdue' && (
          <span className="ml-1 font-medium text-red-400">
            {overdueDays} day{overdueDays === 1 ? '' : 's'} overdue
          </span>
        )}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {children}
        <div className="flex flex-wrap items-center gap-2">
          <CopyMessageButton text={message} />
        </div>
      </div>
    </li>
  )
}

export default async function TodayPage() {
  const today = todayLondon()
  const [data, template] = await Promise.all([getTodayData(), getSetting('client_message_template')])

  const collectedDelta = data.collectedThisMonthPence - data.collectedLastMonthPence
  const deltaLabel =
    data.collectedLastMonthPence === 0
      ? 'last month: —'
      : `${collectedDelta >= 0 ? '▲' : '▼'} vs ${formatMoneyPence(data.collectedLastMonthPence)} last month`

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Today</h1>
        <RunJobButton />
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <Card label="Links to create" count={data.linksToCreate.count} total={formatMoneyPence(data.linksToCreate.totalPence)} />
        <Card label="Waiting for payment" count={data.waiting.count} total={formatMoneyPence(data.waiting.totalPence)} />
        <Card
          label="Overdue"
          count={data.overdue.count}
          total={formatMoneyPence(data.overdue.totalPence)}
          extra={data.overdue.count > 0 ? `oldest: ${data.overdue.oldestDays} days` : undefined}
          tone={data.overdue.count > 0 ? 'red' : 'default'}
        />
        <Card
          label="Collected this month"
          total={formatMoneyPence(data.collectedThisMonthPence)}
          extra={deltaLabel}
          tone="green"
        />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-100">Bond bills needing a link</h2>
        {data.toCreate.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing to do — every scheduled bill has a link. 🎉</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {data.toCreate.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} today={today} template={template}>
                <LinkSaveForm paymentId={payment.id} existingUrl={payment.paymentLinkUrl} />
              </PaymentCard>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-100">Waiting for payment</h2>
        {data.waitingList.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No bills waiting on clients.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {data.waitingList.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} today={today} template={template}>
                <PaymentActions paymentId={payment.id} today={today} undoUntil={null} />
              </PaymentCard>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-100">Marked paid recently</h2>
        {data.recentlyPaid.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing marked paid in the last 24 hours.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {data.recentlyPaid.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} today={today} template={template}>
                {payment.undoUntil ? (
                  <PaymentActions paymentId={payment.id} today={today} undoUntil={payment.undoUntil} />
                ) : (
                  <p className="text-xs text-emerald-400">✓ Paid</p>
                )}
              </PaymentCard>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-red-400">Overdue</h2>
        {data.overdueList.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nobody overdue. Lovely.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {data.overdueList.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} today={today} template={template}>
                <PaymentActions paymentId={payment.id} today={today} undoUntil={null} />
                <div>
                  <SuspendBusinessButton businessId={payment.businessId} />
                </div>
              </PaymentCard>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-100">Today&apos;s activity</h2>
        <p className="mt-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
          Bookings, texts and enquiries: <span className="text-slate-400">not connected yet</span> —
          those modules arrive in later phases.
        </p>
      </section>
    </div>
  )
}
