import * as React from "react";
import { logger } from "@/lib/logger";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a time string to 12-hour format in IST
 * 
 * @param timeString - Time string in 24-hour format (HH:MM) or ISO datetime string
 * @param isStoredInUTC - Whether the time is stored in UTC (default: false)
 * 
 * @example
 * formatTimeIST('14:30') // returns: "2:30 PM"
 * formatTimeIST('09:00') // returns: "9:00 AM"
 * formatTimeIST('2025-06-29T04:30:00Z', true) // returns: "10:00 AM" (UTC+5:30)
 */
export function formatTimeIST(timeString?: string | null, isStoredInUTC: boolean = false): string {
  if (!timeString) return '';
  
  try {
    let date: Date;
    
    if (isStoredInUTC) {
      // If it's a full datetime string stored in UTC, parse and convert to IST
      date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      date = new Date(date.getTime() + istOffset);
    } else {
      // If it's just a time string (HH:MM), treat it as IST already
      const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (!timeMatch) return timeString;
      
      const [, hours, minutes] = timeMatch;
      date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    logger.error('Error formatting time:', error);
    return timeString || '';
  }
}

/**
 * Gets the current time in IST formatted as HH:MM (24-hour format)
 * Used for storing consistent timezone-aware times
 */
export function getCurrentTimeIST(): string {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Gets the current date in IST formatted as YYYY-MM-DD
 */
export function getCurrentDateStringIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  const year = istTime.getUTCFullYear();
  const month = (istTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const date = istTime.getUTCDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${date}`;
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

// Returns a gender display string or icon (M/F/Male/Female)
// Optionally returns a React element with an icon if passed a flag
export function renderGender(gender?: string | null, withIcon = false): string | React.ReactNode {
  if (!gender) return '-';
  const g = gender.toLowerCase();
  if (withIcon) {
    if (g.startsWith('m')) return React.createElement('span', { title: 'Male' }, '♂️');
    if (g.startsWith('f')) return React.createElement('span', { title: 'Female' }, '♀️');
    return '-';
  }
  if (g.startsWith('m')) return 'M';
  if (g.startsWith('f')) return 'F';
  return '-';
}

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

type ConsultationWithJoins = {
  created_at?: string | null;
  specialty_data?: Record<string, unknown> | null;
  appointments?: {
    doctors?: { name?: string } | null;
  } | null;
};

/**
 * Extracts follow-up date and doctor name from the most recent consultation.
 * Caller must provide consultations sorted by created_at descending — the first
 * element is assumed to be the latest.
 */
export function extractFollowUp(consultations: Array<Record<string, unknown>> | null | undefined): {
  date: string;
  doctorName: string;
} | null {
  const latest = consultations?.[0] as ConsultationWithJoins | undefined;
  if (!latest) return null;
  const followUpDate = latest.specialty_data?.follow_up_date as string | undefined;
  if (!followUpDate) return null;
  const doctorName = latest.appointments?.doctors?.name;
  return { date: followUpDate, doctorName: doctorName ?? 'Unknown' };
}
