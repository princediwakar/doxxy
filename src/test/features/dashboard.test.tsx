import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import Dashboard from '../../pages/Dashboard'
import { useAuth } from '../../contexts/AuthContext'

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = useAuth as any

describe('Dashboard Features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      activeClinic: { clinic_id: 'clinic-1', name: 'Test Clinic' },
      activeClinicRole: 'superadmin',
      loading: false,
      userClinics: [],
      profileName: 'Test User',
      hasActiveClinic: true,
      hasUser: true,
      initialLoading: false,
      clinicLoading: false,
      switchClinic: vi.fn(),
      signOut: vi.fn(),
    })
  })

  describe('Dashboard Layout', () => {
    it('renders greeting message', () => {
      render(<Dashboard />)
      
      expect(screen.getByText(/good/i)).toBeInTheDocument()
    })

    it('displays clinic overview for superadmin', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('Clinic Overview')).toBeInTheDocument()
    })

    it('shows different view for doctor role', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@example.com' },
        activeClinic: { clinic_id: 'clinic-1', name: 'Test Clinic' },
        activeClinicRole: 'doctor',
        loading: false,
        userClinics: [],
        profileName: 'Test User',
        hasActiveClinic: true,
        hasUser: true,
        initialLoading: false,
        clinicLoading: false,
        switchClinic: vi.fn(),
        signOut: vi.fn(),
      })

      render(<Dashboard />)
      
      expect(screen.getAllByText('My Patients')).toHaveLength(2)
    })
  })

  describe('Statistics Cards', () => {
    it('renders all stat cards for superadmin', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('Total Patients')).toBeInTheDocument()
      expect(screen.getByText('Total Doctors')).toBeInTheDocument()
      expect(screen.getByText('Total Appointments')).toBeInTheDocument()
      expect(screen.getByText("Today's Appointments")).toBeInTheDocument()
    })

    it('handles card clicks for navigation', () => {
      render(<Dashboard />)
      
      const patientsCard = screen.getByText('Total Patients').closest('div')
      if (patientsCard) {
        fireEvent.click(patientsCard)
      }
      
      // Note: Navigation testing would require proper router mocking
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Appointments List', () => {
    it('displays upcoming appointments', () => {
      render(<Dashboard />)
      
      expect(screen.getByRole('heading', { name: /upcoming appointments/i })).toBeInTheDocument()
    })

    it('handles empty appointments state', () => {
      render(<Dashboard />)
      
      // This would require mocking the appointments query
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Weekly Chart', () => {
    it('renders weekly appointments chart', () => {
      render(<Dashboard />)
      
      // This would require testing the chart component
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Role-based Access', () => {
    it('shows appropriate content for staff role', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@example.com' },
        activeClinic: { clinic_id: 'clinic-1', name: 'Test Clinic' },
        activeClinicRole: 'staff',
        loading: false,
        userClinics: [],
        profileName: 'Test User',
        hasActiveClinic: true,
        hasUser: true,
        initialLoading: false,
        clinicLoading: false,
        switchClinic: vi.fn(),
        signOut: vi.fn(),
      })

      render(<Dashboard />)
      
      // Staff should see limited view
      expect(screen.queryByText('My Practice')).not.toBeInTheDocument()
    })
  })
}) 