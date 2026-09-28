import type { IntakeService } from './intake'
import { escapeHtml } from './baseline'

// The booking form embedded in generated sites when the business takes
// bookings. Behavior lives in /booking.js on the app host (one update point),
// driven by the data attributes here.
export function renderBookingForm(opts: {
  slug: string
  publicAppHost: string
  services: IntakeService[]
}): string {
  const e = escapeHtml
  const options = opts.services
    .map((s) => `          <option value="${e(s.name)}">${e(s.name)}${s.price ? ` — £${e(s.price)}` : ''}</option>`)
    .join('\n')

  return `  <section id="book" aria-labelledby="book-heading" class="booking">
    <h2 id="book-heading">Book an appointment</h2>
    <form id="booking-form" data-slug="${opts.slug}" data-api="https://${opts.publicAppHost}">
      <div class="booking-grid">
        <label>Service
          <select name="service" required>
          <option value="" disabled selected>Choose a service…</option>
${options}
          </select>
        </label>
        <label>Date
          <input name="date" type="date" required>
        </label>
        <label>Time
          <select name="time" required>
            <option value="" disabled selected>Pick a time…</option>
            ${['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30'].map((t) => `<option value="${t}">${t}</option>`).join('\n            ')}
          </select>
        </label>
        <label>Your name
          <input name="name" type="text" autocomplete="name" required>
        </label>
        <label>Your phone
          <input name="phone" type="tel" autocomplete="tel" required>
        </label>
        <label class="booking-note">Note (optional)
          <input name="note" type="text" maxlength="500">
        </label>
      </div>
      <p class="booking-error" id="booking-error" hidden></p>
      <p class="booking-success" id="booking-success" hidden>Booked! We’ll confirm shortly — see you soon.</p>
      <button type="submit" class="btn btn--primary booking-submit">Book appointment</button>
    </form>
    <script src="https://${opts.publicAppHost}/booking.js" defer></script>
  </section>`
}

// The CSS every booking form needs (uses the site's own variables).
export const BOOKING_CSS = `
.booking-grid { display: grid; gap: .75rem; }
.booking-grid label { display: flex; flex-direction: column; gap: .3rem; font-size: .9rem; color: var(--muted); }
.booking-grid input, .booking-grid select {
  background: var(--surface); color: var(--text); border: 1px solid var(--line);
  border-radius: .5rem; padding: .75rem .8rem; font-size: 1rem; width: 100%;
}
.booking-grid input:focus, .booking-grid select:focus { border-color: var(--accent); outline: none; }
.booking-submit { margin-top: 1rem; width: 100%; text-align: center; }
.booking-error { margin-top: .75rem; background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
.booking-success { margin-top: .75rem; background: #064e3b; color: #a7f3d0; border: 1px solid #065f46; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
@media (min-width: 36rem) {
  .booking-grid { grid-template-columns: 1fr 1fr; }
  .booking-note { grid-column: 1 / -1; }
}
`
