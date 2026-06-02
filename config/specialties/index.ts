// Path: config/specialties/index.ts
import type { SpecialtyConfig } from './types';

// Configs imported individually so tree-shaking works at the route level
export { default as dermatology } from './dermatology';
export { default as dental } from './dental';
export { default as ophthalmology } from './ophthalmology';
export { default as ent } from './ent';
export { default as pediatrics } from './pediatrics';
export { default as gynecology } from './gynecology';
export { default as orthopedics } from './orthopedics';
export { default as generalPhysician } from './general-physician';

export const specialtySlugs = [
  'dermatology',
  'dental',
  'ophthalmology',
  'ent',
  'pediatrics',
  'gynecology',
  'orthopedics',
  'general-physician',
] as const;

export type SpecialtySlug = (typeof specialtySlugs)[number];

const configs: Record<SpecialtySlug, () => Promise<{ default: SpecialtyConfig }>> = {
  dermatology: () => import('./dermatology'),
  dental: () => import('./dental'),
  ophthalmology: () => import('./ophthalmology'),
  ent: () => import('./ent'),
  pediatrics: () => import('./pediatrics'),
  gynecology: () => import('./gynecology'),
  orthopedics: () => import('./orthopedics'),
  'general-physician': () => import('./general-physician'),
};

export async function getSpecialtyConfig(slug: string): Promise<SpecialtyConfig | null> {
  if (!(slug in configs)) return null;
  const mod = await configs[slug as SpecialtySlug]();
  return mod.default;
}
