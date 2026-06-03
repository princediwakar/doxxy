// Path: config/cities/index.ts
import type { CityConfig } from './types'

export { default as mumbai } from './mumbai'
export { default as delhi } from './delhi'
export { default as bangalore } from './bangalore'
export { default as pune } from './pune'
export { default as hyderabad } from './hyderabad'
export { default as chennai } from './chennai'
export { default as ahmedabad } from './ahmedabad'
export { default as kolkata } from './kolkata'
export { default as jaipur } from './jaipur'
export { default as lucknow } from './lucknow'
export { default as surat } from './surat'
export { default as nagpur } from './nagpur'
export { default as indore } from './indore'
export { default as bhopal } from './bhopal'
export { default as chandigarh } from './chandigarh'
export { default as kochi } from './kochi'
export { default as vadodara } from './vadodara'
export { default as visakhapatnam } from './visakhapatnam'
export { default as coimbatore } from './coimbatore'
export { default as ludhiana } from './ludhiana'
export { default as agra } from './agra'
export { default as nashik } from './nashik'
export { default as patna } from './patna'
export { default as rajkot } from './rajkot'
export { default as meerut } from './meerut'

export const citySlugs = [
  'mumbai',
  'delhi',
  'bangalore',
  'pune',
  'hyderabad',
  'chennai',
  'ahmedabad',
  'kolkata',
  'jaipur',
  'lucknow',
  'surat',
  'nagpur',
  'indore',
  'bhopal',
  'chandigarh',
  'kochi',
  'vadodara',
  'visakhapatnam',
  'coimbatore',
  'ludhiana',
  'agra',
  'nashik',
  'patna',
  'rajkot',
  'meerut',
] as const

export type CitySlug = (typeof citySlugs)[number]

const configs: Record<CitySlug, () => Promise<{ default: CityConfig }>> = {
  mumbai: () => import('./mumbai'),
  delhi: () => import('./delhi'),
  bangalore: () => import('./bangalore'),
  pune: () => import('./pune'),
  hyderabad: () => import('./hyderabad'),
  chennai: () => import('./chennai'),
  ahmedabad: () => import('./ahmedabad'),
  kolkata: () => import('./kolkata'),
  jaipur: () => import('./jaipur'),
  lucknow: () => import('./lucknow'),
  surat: () => import('./surat'),
  nagpur: () => import('./nagpur'),
  indore: () => import('./indore'),
  bhopal: () => import('./bhopal'),
  chandigarh: () => import('./chandigarh'),
  kochi: () => import('./kochi'),
  vadodara: () => import('./vadodara'),
  visakhapatnam: () => import('./visakhapatnam'),
  coimbatore: () => import('./coimbatore'),
  ludhiana: () => import('./ludhiana'),
  agra: () => import('./agra'),
  nashik: () => import('./nashik'),
  patna: () => import('./patna'),
  rajkot: () => import('./rajkot'),
  meerut: () => import('./meerut'),
}

export async function getCityConfig(slug: string): Promise<CityConfig | null> {
  if (!(slug in configs)) return null
  const mod = await configs[slug as CitySlug]()
  return mod.default
}
