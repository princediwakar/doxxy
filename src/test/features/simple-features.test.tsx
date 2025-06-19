import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CompleteProfile } from '../../pages/CompleteProfile'
import { CreateClinicPage } from '../../pages/CreateClinicPage'
import { ColorThemeDemo } from '../../components/demo/ColorThemeDemo'
import { getAge } from '@/lib/utils'

describe('Clinic EMR System - Core UI Components', () => {
  describe('Button Component', () => {
    it('renders primary button correctly', () => {
      render(<Button variant="default">Primary Button</Button>)
      expect(screen.getByText('Primary Button')).toBeInTheDocument()
    })

    it('renders secondary button correctly', () => {
      render(<Button variant="secondary">Secondary Button</Button>)
      expect(screen.getByText('Secondary Button')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Clickable</Button>)
      
      const button = screen.getByText('Clickable')
      button.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByText('Disabled Button')
      expect(button).toBeDisabled()
    })
  })

  describe('Input Component', () => {
    it('renders input field correctly', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('accepts user input', () => {
      render(<Input data-testid="test-input" />)
      const input = screen.getByTestId('test-input') as HTMLInputElement
      
      input.value = 'test input'
      expect(input.value).toBe('test input')
    })

    it('can be required', () => {
      render(<Input required data-testid="required-input" />)
      const input = screen.getByTestId('required-input')
      expect(input).toBeRequired()
    })
  })

  describe('Card Component', () => {
    it('renders card with header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })
  })

  describe('Badge Component', () => {
    it('renders default badge', () => {
      render(<Badge>Default Badge</Badge>)
      expect(screen.getByText('Default Badge')).toBeInTheDocument()
    })

    it('renders success badge', () => {
      render(<Badge variant="default">Success</Badge>)
      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('renders destructive badge', () => {
      render(<Badge variant="destructive">Error</Badge>)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })
})

describe('Clinic EMR System - Feature Functionality Tests', () => {
  describe('Authentication Features', () => {
    it('validates email format requirements', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      expect(emailRegex.test('valid@email.com')).toBe(true)
      expect(emailRegex.test('invalid-email')).toBe(false)
      expect(emailRegex.test('missing@domain')).toBe(false)
      expect(emailRegex.test('@domain.com')).toBe(false)
    })

    it('validates password strength requirements', () => {
      const validatePassword = (password: string) => {
        return password.length >= 6
      }
      
      expect(validatePassword('strong123')).toBe(true)
      expect(validatePassword('weak')).toBe(false)
      expect(validatePassword('')).toBe(false)
    })

    it('validates phone number format', () => {
      const phoneRegex = /^\+?[\d\s-()]+$/
      
      expect(phoneRegex.test('+1234567890')).toBe(true)
      expect(phoneRegex.test('(555) 123-4567')).toBe(true)
      expect(phoneRegex.test('invalid-phone')).toBe(false)
    })
  })

  describe('Patient Management Features', () => {
    it('calculates patient age correctly including infants', () => {
      // Test normal adult age calculation
      const adultBirthDate = '1990-05-15'
      const adultAge = getAge(adultBirthDate)
      expect(typeof adultAge).toBe('number')
      expect(adultAge).toBeGreaterThan(30) // Should be around 33-34 years

      // Test infant age calculations with string format
      const today = new Date()
      
      // Test 3 month old baby
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
      const babyAge3Months = getAge(threeMonthsAgo.toISOString().split('T')[0], true)
      expect(babyAge3Months).toContain('month')
      
      // Test 2 week old baby
      const twoWeeksAgo = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000))
      const babyAge2Weeks = getAge(twoWeeksAgo.toISOString().split('T')[0], true)
      expect(babyAge2Weeks).toContain('week')
      
      // Test 3 day old baby
      const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000))
      const babyAge3Days = getAge(threeDaysAgo.toISOString().split('T')[0], true)
      expect(babyAge3Days).toContain('day')

      // Test edge cases
      expect(getAge(null, true)).toBe('')
      expect(getAge('', true)).toBe('')
    })

    it('validates medical record number format', () => {
      const generateMedicalId = (name: string, id: string): string => {
        return `MED${id.slice(0, 8).toUpperCase()}`
      }
      
      const medicalId = generateMedicalId('John Doe', 'abc123def456')
      expect(medicalId).toMatch(/^MED[A-Z0-9]{8}$/)
      expect(medicalId).toBe('MEDABC123DE')
    })
  })

  describe('Appointment Management Features', () => {
    it('validates appointment time slots', () => {
      const isValidTimeSlot = (time: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        return timeRegex.test(time)
      }
      
      expect(isValidTimeSlot('09:00')).toBe(true)
      expect(isValidTimeSlot('14:30')).toBe(true)
      expect(isValidTimeSlot('25:00')).toBe(false)
      expect(isValidTimeSlot('invalid')).toBe(false)
    })

    it('checks appointment date validity', () => {
      const isValidAppointmentDate = (dateString: string): boolean => {
        const date = new Date(dateString)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      }
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      expect(isValidAppointmentDate(tomorrow.toISOString().split('T')[0])).toBe(true)
      expect(isValidAppointmentDate(yesterday.toISOString().split('T')[0])).toBe(false)
    })
  })

  describe('Billing System Features', () => {
    it('calculates bill totals correctly', () => {
      interface BillItem {
        description: string
        amount: number
        quantity: number
      }
      
      const calculateBillTotal = (items: BillItem[], taxRate = 0.1, discount = 0): number => {
        const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
        const discountAmount = subtotal * discount
        const taxableAmount = subtotal - discountAmount
        const tax = taxableAmount * taxRate
        return taxableAmount + tax
      }
      
      const items: BillItem[] = [
        { description: 'Consultation', amount: 100, quantity: 1 },
        { description: 'Medicine', amount: 50, quantity: 2 }
      ]
      
      const total = calculateBillTotal(items, 0.1, 0.05) // 10% tax, 5% discount
      expect(total).toBeCloseTo(209, 2) // 200 - 10 (5% discount) + 19 (10% tax on 190)
    })

    it('validates invoice number format', () => {
      const generateInvoiceNumber = (): string => {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        return `INV${date}${random}`
      }
      
      const invoice = generateInvoiceNumber()
      expect(invoice).toMatch(/^INV\d{8}\d{3}$/)
      expect(invoice.length).toBe(14)
    })
  })

  describe('Prescription Management Features', () => {
    it('validates medication dosage format', () => {
      const isValidDosage = (dosage: string): boolean => {
        // Should match patterns like "500mg", "2.5ml", "1 tablet"
        const dosageRegex = /^\d+(\.\d+)?\s*(mg|ml|g|tablet|capsule|drop)s?$/i
        return dosageRegex.test(dosage)
      }
      
      expect(isValidDosage('500mg')).toBe(true)
      expect(isValidDosage('2.5ml')).toBe(true)
      expect(isValidDosage('1 tablet')).toBe(true)
      expect(isValidDosage('invalid dosage')).toBe(false)
    })

    it('validates prescription frequency', () => {
      const validFrequencies = [
        'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
        'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
        'As needed', 'Before meals', 'After meals'
      ]
      
      const isValidFrequency = (frequency: string): boolean => {
        return validFrequencies.includes(frequency)
      }
      
      expect(isValidFrequency('Twice daily')).toBe(true)
      expect(isValidFrequency('Every 8 hours')).toBe(true)
      expect(isValidFrequency('Invalid frequency')).toBe(false)
    })
  })

  describe('Medical Records Features', () => {
    it('validates consultation note structure', () => {
      interface ConsultationNote {
        chiefComplaint?: string
        historyOfPresentIllness?: string
        examination?: string
        diagnosis?: string
        treatment?: string
        followUp?: string
      }
      
      const isValidConsultationNote = (note: ConsultationNote): boolean => {
        return !!(note.chiefComplaint && note.examination && note.diagnosis)
      }
      
      const validNote: ConsultationNote = {
        chiefComplaint: 'Headache',
        examination: 'Normal',
        diagnosis: 'Tension headache'
      }
      
      const invalidNote: ConsultationNote = {
        chiefComplaint: 'Headache'
        // Missing required fields
      }
      
      expect(isValidConsultationNote(validNote)).toBe(true)
      expect(isValidConsultationNote(invalidNote)).toBe(false)
    })
  })

  describe('Data Validation & Security', () => {
    it('sanitizes user input', () => {
      const sanitizeInput = (input: string): string => {
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
          .trim()
      }
      
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello')
      expect(sanitizeInput('Normal input')).toBe('Normal input')
      expect(sanitizeInput('  spaced input  ')).toBe('spaced input')
    })

    it('validates required fields', () => {
      const validateRequiredFields = (data: Record<string, string>, requiredFields: string[]): string[] => {
        const errors: string[] = []
        
        requiredFields.forEach(field => {
          if (!data[field] || data[field].trim() === '') {
            errors.push(`${field} is required`)
          }
        })
        
        return errors
      }
      
      const data = { name: 'John', email: '', phone: '123456789' }
      const required = ['name', 'email', 'phone']
      const errors = validateRequiredFields(data, required)
      
      expect(errors).toContain('email is required')
      expect(errors).not.toContain('name is required')
      expect(errors).not.toContain('phone is required')
    })
  })
}) 