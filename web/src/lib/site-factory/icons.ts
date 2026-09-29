// Inline SVG icons for generated sites — no icon libraries, no external files.
// Stroke-based (currentColor), so they inherit the site's text/accent colour.

const ICONS: Record<string, string> = {
  scissors:
    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="8.1" y1="7.6" x2="20" y2="19"/><line x1="8.1" y1="16.4" x2="20" y2="5"/>',
  flame: '<path d="M12 2c1 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-3-1-3s3 1 3 5a6 6 0 0 1-12 0c0-6 6-8 6-12z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/>',
  pin: '<path d="M12 22s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="11" r="2.5"/>',
  phone:
    '<path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>',
  star: '<path d="M12 2l2.9 6.3 6.6.5-5 4.4 1.5 6.5L12 16.9 6 19.7l1.5-6.5-5-4.4 6.6-.5L12 2z"/>',
  check: '<circle cx="12" cy="12" r="9"/><polyline points="8 12.5 10.8 15.2 16 9.5"/>',
  sparkles:
    '<path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"/>',
  coffee:
    '<path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2"/><line x1="6" y1="3" x2="6" y2="5"/><line x1="10" y1="3" x2="10" y2="5"/><line x1="14" y1="3" x2="14" y2="5"/>',
  leaf: '<path d="M5 19C5 11 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19c3-5 6-8 10-10"/>',
  heart:
    '<path d="M12 20s-7-4.5-9-9c-1.5-3.5 1-7 4.5-7 2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4c3.5 0 6 3.5 4.5 7-2 4.5-9 9-9 9z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-8 8c-1.4 0-2.7-.3-3.9-.9L4 20l.9-5.1A8 8 0 1 1 21 12z"/>',
  camera:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
}

export const ICON_NAMES = Object.keys(ICONS)

export function iconSvg(name: string, cls = 'icon'): string {
  const body = ICONS[name] ?? ICONS.star
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
}

// The catalog embedded in the generation prompt so the model can copy the SVGs.
export function iconCatalog(): string {
  return ICON_NAMES.map((name) => `${name}: ${iconSvg(name)}`).join('\n')
}

// Default "why us" cards per business type for the baseline renderer.
export const FEATURE_CARDS: Record<string, { icon: string; title: string }[]> = {
  barber_hair: [
    { icon: 'scissors', title: 'Sharp fades' },
    { icon: 'flame', title: 'Hot towel finish' },
    { icon: 'clock', title: 'Walk-ins welcome' },
  ],
  beauty_spa: [
    { icon: 'sparkles', title: 'Unrushed treatments' },
    { icon: 'leaf', title: 'Gentle products' },
    { icon: 'calendar', title: 'Easy booking' },
  ],
  cafe: [
    { icon: 'coffee', title: 'Proper coffee' },
    { icon: 'heart', title: 'Made with care' },
    { icon: 'pin', title: 'Right in town' },
  ],
  restaurant: [
    { icon: 'flame', title: 'Cooked to order' },
    { icon: 'heart', title: 'Family recipes' },
    { icon: 'pin', title: 'Easy to find' },
  ],
  cleaning: [
    { icon: 'check', title: 'Fully insured' },
    { icon: 'sparkles', title: 'Every corner' },
    { icon: 'calendar', title: 'Flexible slots' },
  ],
  laundry: [
    { icon: 'check', title: 'Careful handling' },
    { icon: 'clock', title: 'Quick turnaround' },
    { icon: 'calendar', title: 'Regular pick-ups' },
  ],
  retail: [
    { icon: 'check', title: 'Honest prices' },
    { icon: 'heart', title: 'Personal service' },
    { icon: 'pin', title: 'Easy to reach' },
  ],
  local_services: [
    { icon: 'check', title: 'Trusted locally' },
    { icon: 'clock', title: 'On time, every time' },
    { icon: 'pin', title: 'Covering your area' },
  ],
  other: [
    { icon: 'check', title: 'Trusted locally' },
    { icon: 'heart', title: 'Personal service' },
    { icon: 'clock', title: 'Flexible hours' },
  ],
}
