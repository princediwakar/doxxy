// Path: config/cities/index.ts
import type { CityConfig } from './types'

export { default as mumbai } from './mumbai'
export { default as delhi } from './delhi'
export { default as bangalore } from './bangalore'
export { default as pune } from './pune'
export { default as hyderabad } from './hyderabad'
export { default as chennai } from './chennai'

export const citySlugs = [
  'mumbai',
  'delhi',
  'bangalore',
  'pune',
  'hyderabad',
  'chennai',
] as const

export type CitySlug = (typeof citySlugs)[number]

const configs: Record<CitySlug, () => Promise<{ default: CityConfig }>> = {
  mumbai: () => import('./mumbai'),
  delhi: () => import('./delhi'),
  bangalore: () => import('./bangalore'),
  pune: () => import('./pune'),
  hyderabad: () => import('./hyderabad'),
  chennai: () => import('./chennai'),
}

export async function getCityConfig(slug: string): Promise<CityConfig | null> {
  if (!(slug in configs)) return null
  const mod = await configs[slug as CitySlug]()
  return mod.default
}
