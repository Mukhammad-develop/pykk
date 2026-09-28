// The structured website intake collected in the panel per business,
// and shared by the baseline renderer and the AI prompt.

export interface IntakeHours {
  // '09:00–18:00' or 'closed'
  [day: string]: string // mon, tue, wed, thu, fri, sat, sun
}

export interface IntakeService {
  name: string
  price: string // '15' or '15.00' (pounds, display only)
}

export interface IntakeReview {
  author: string
  text: string
}

// Design moods: the client picks a look; the type decides the content presets.
export const MOODS = [
  {
    id: 'dark-bold',
    label: 'Dark & bold',
    hint: 'dramatic, confident, night-time energy',
    direction:
      'Dark, masculine, sharp: near-black background #14110d, warm off-white text #ede6da, amber accent #d9a441. Condensed uppercase headings with letter-spacing, sharp corners, ruled price table with dotted leaders, thin horizontal rules.',
  },
  {
    id: 'light-elegant',
    label: 'Light & elegant',
    hint: 'calm, airy, premium spa feel',
    direction:
      'Light, calm, elegant: cream background #faf6f1, deep plum-grey text #43333a, dusty rose accent #a4576b, soft sage secondary #7d8b76. Georgia serif headings, generous whitespace, 18px-radius cards with soft shadows, pill buttons.',
  },
  {
    id: 'warm-rustic',
    label: 'Warm & rustic',
    hint: 'cosy, welcoming, handcrafted',
    direction:
      'Warm, rustic, appetising: paper background #f8f2e4, dark brown text #3b2a1e, forest green accent #33573c, terracotta secondary #b0502a. Georgia serif, dotted leaders in the menu/price list, dashed hand-drawn section rules, stamp-style bordered CTA.',
  },
  {
    id: 'bright-practical',
    label: 'Bright & practical',
    hint: 'clean, fresh, trustworthy',
    direction:
      'Bright, practical, trustworthy: white background, navy text #12283f, strong blue accent #0b5cab (white text on it), warm yellow #f2b705 highlights on dark areas only. Helvetica/Arial, cards with a 4px left accent border, big tap targets.',
  },
] as const

export type MoodId = (typeof MOODS)[number]['id']

export function moodById(id: string | undefined, fallbackType?: string): (typeof MOODS)[number] {
  const found = MOODS.find((m) => m.id === id)
  if (found) return found
  // sensible per-type default
  const byType: Record<string, MoodId> = {
    barber_hair: 'dark-bold',
    beauty_spa: 'light-elegant',
    cafe: 'warm-rustic',
    restaurant: 'warm-rustic',
    cleaning: 'bright-practical',
    laundry: 'bright-practical',
    retail: 'bright-practical',
    local_services: 'bright-practical',
    other: 'dark-bold',
  }
  return MOODS.find((m) => m.id === (byType[fallbackType ?? ''] ?? 'dark-bold'))!
}

export interface SiteIntake {
  ownerName: string
  phone: string
  whatsapp: string
  email: string
  address: string
  landmark: string // "near the station", town if no address
  hours: IntakeHours
  services: IntakeService[]
  additionalInfo: string
  mood: MoodId | ''
  reviews: IntakeReview[] // REAL, client-supplied only — never invented
  socials: { instagram: string; facebook: string }
  heroPhoto: boolean // use the first photo as a large hero backdrop
  extras: {
    barberMode?: 'walk-ins' | 'appointments' | 'both'
    appointmentOnly?: boolean // beauty
    cafeService?: 'eat-in' | 'takeaway' | 'both'
    areasCovered?: string // services
    callOut?: string // services
  }
  photos: string[] // filenames in sites/{slug}/images/
}

export const EMPTY_INTAKE: SiteIntake = {
  ownerName: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  landmark: '',
  hours: {},
  services: [],
  additionalInfo: '',
  mood: '',
  reviews: [],
  socials: { instagram: '', facebook: '' },
  heroPhoto: false,
  extras: {},
  photos: [],
}

export const DAY_ORDER = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
] as const

export const TYPE_PRESETS: Record<string, IntakeService[]> = {
  barber_hair: [
    { name: 'Skin fade', price: '' },
    { name: 'Beard trim & shape', price: '' },
    { name: 'Kids cut', price: '' },
    { name: 'Full service (cut + beard)', price: '' },
  ],
  beauty_spa: [
    { name: 'Gel manicure', price: '' },
    { name: 'Facial treatment', price: '' },
    { name: 'Full body massage', price: '' },
    { name: 'Waxing', price: '' },
  ],
  cafe: [
    { name: 'Flat white', price: '' },
    { name: 'Full breakfast', price: '' },
    { name: 'Soup of the day', price: '' },
    { name: 'Homemade cake', price: '' },
  ],
  restaurant: [
    { name: 'Main course', price: '' },
    { name: 'Starter', price: '' },
    { name: 'Dessert', price: '' },
    { name: 'Set menu', price: '' },
  ],
  cleaning: [
    { name: 'Regular home clean', price: '' },
    { name: 'Deep clean', price: '' },
    { name: 'End of tenancy clean', price: '' },
    { name: 'Oven clean', price: '' },
  ],
  laundry: [
    { name: 'Wash & fold (per bag)', price: '' },
    { name: 'Ironing (per item)', price: '' },
    { name: 'Duvet cleaning', price: '' },
  ],
  retail: [{ name: 'See in store for prices', price: '' }],
  local_services: [
    { name: 'Call-out / first hour', price: '' },
    { name: 'Standard job', price: '' },
  ],
  other: [{ name: 'Main service', price: '' }],
}
