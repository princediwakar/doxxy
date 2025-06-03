import * as React from "react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns age in years from a date string (YYYY-MM-DD or ISO)
export function getAge(dateOfBirth?: string | null): string {
  if (!dateOfBirth) return '';
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age.toString();
}

// Returns a gender display string or icon (M/F/Male/Female/Other)
// Optionally returns a React element with an icon if passed a flag
export function renderGender(gender?: string | null, withIcon = false): string | React.ReactNode {
  if (!gender) return '-';
  const g = gender.toLowerCase();
  if (withIcon) {
    if (g.startsWith('m')) return React.createElement('span', { title: 'Male' }, '♂️');
    if (g.startsWith('f')) return React.createElement('span', { title: 'Female' }, '♀️');
    return React.createElement('span', { title: 'Other' }, '⚧️');
  }
  if (g.startsWith('m')) return 'M';
  if (g.startsWith('f')) return 'F';
  return gender;
}
