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
