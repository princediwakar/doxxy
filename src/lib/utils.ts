import * as React from "react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns age from a date string, with appropriate units for infants
 * 
 * @param dateOfBirth - Date string (YYYY-MM-DD or ISO format)
 * @param returnAsString - If true, returns formatted string with units; if false, returns number
 * 
 * @example
 * // For adults (2+ years)
 * getAge('1990-05-15') // returns: 34 (number)
 * getAge('1990-05-15', true) // returns: "34 years" (string)
 * 
 * // For infants
 * getAge('2024-11-15', true) // returns: "5 weeks" (if current date is Dec 2024)
 * getAge('2024-03-15', true) // returns: "8 months" (if current date is Nov 2024)
 * getAge('2024-12-28', true) // returns: "3 days" (if current date is Dec 31, 2024)
 */
export function getAge(dateOfBirth?: string | null, returnAsString: boolean = false): string | number {
  if (!dateOfBirth) return returnAsString ? '' : 0;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return returnAsString ? '' : 0;
  
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  
  // For infants under 2 years, show more precise age
  if (age < 2) {
    const totalMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    const adjustedMonths = dayDiff < 0 ? totalMonths - 1 : totalMonths;
    
    if (adjustedMonths < 2) {
      // Less than 2 months - show in weeks or days
      const timeDiff = today.getTime() - dob.getTime();
      const days = Math.floor(timeDiff / (1000 * 3600 * 24));
      const weeks = Math.floor(days / 7);
      
      if (days < 7) {
        return returnAsString ? `${days} day${days !== 1 ? 's' : ''}` : days;
      } else if (weeks < 8) {
        return returnAsString ? `${weeks} week${weeks !== 1 ? 's' : ''}` : weeks;
      } else {
        return returnAsString ? `${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}` : adjustedMonths;
      }
    } else if (adjustedMonths < 24) {
      // 2-24 months - show in months
      return returnAsString ? `${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}` : adjustedMonths;
    }
  }
  
  // 2+ years - show in years
  return returnAsString ? `${age} year${age !== 1 ? 's' : ''}` : age;
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
