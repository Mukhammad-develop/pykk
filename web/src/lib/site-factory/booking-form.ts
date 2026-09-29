import type { IntakeService } from './intake'
import { escapeHtml } from './baseline'

// The booking form embedded in generated sites when the business takes
// bookings. FULLY self-contained: its own <style> block means it looks right
// whether the page's stylesheet was written by the AI or by the fallback
// renderer (the AI never defines our CSS variables, so the form used to
// render unstyled). Behavior lives in /booking.js on the app host.
export function renderBookingForm(opts: {
  slug: string
  publicAppHost: string
  services: IntakeService[]
}): string {
  const e = escapeHtml
  const options = opts.services
    .map((s) => `          <option value="${e(s.name)}">${e(s.name)}${s.price ? ` — £${e(s.price)}` : ''}</option>`)
    .join('\n')

  return `  <section id="book" aria-label="Book an appointment" class="booking">
<style>
#book .booking-grid { display: grid; gap: .9rem; margin-top: 1rem; }
#book .booking-grid label { display: flex; flex-direction: column; gap: .4rem; font-size: .95rem; font-weight: 600; }
#book .booking-grid input, #book .booking-grid select {
  width: 100%; box-sizing: border-box; background: #fff; color: #1a1a1a;
  border: 1.5px solid rgba(0,0,0,.22); border-radius: .55rem;
  padding: .8rem .9rem; font-size: 1.05rem; font-family: inherit;
  transition: border-color .2s ease, box-shadow .2s ease;
}
#book .booking-grid input:focus, #book .booking-grid select:focus {
  border-color: currentColor; outline: none; box-shadow: 0 0 0 3px rgba(0,0,0,.08);
}
#book .booking-submit { margin-top: 1.2rem; width: 100%; text-align: center; padding: 1rem; font-size: 1.05rem; cursor: pointer; }
#book .booking-error { margin-top: .75rem; background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
#book .booking-success { margin-top: .75rem; background: #064e3b; color: #a7f3d0; border: 1px solid #065f46; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
#book .booking-submit { background: var(--accent, #33573c); color: #fff; border: none; border-radius: .55rem; font-weight: 700; }
#book .booking-submit:hover { filter: brightness(1.1); }
#book .booking-submit:disabled { opacity: .55; }
@media (min-width: 36rem) {
  #book .booking-grid { grid-template-columns: 1fr 1fr; }
  #book .booking-note { grid-column: 1 / -1; }
}
</style>
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
