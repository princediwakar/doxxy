import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('sonner');

const mockSupabase = {
  auth: {
    signInWithOtp: jest.fn(),
    signInWithOAuth: jest.fn(),
    verifyOtp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
  from: jest.fn(),
  rpc: jest.fn(),
};

// Create a wrapper component for AuthProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    (getSupabase as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe('Magic Link Authentication', () => {
    it('should handle successful magic link request', async () => {
      const email = 'test@example.com';
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.handleEmailAuth(email);
      });

      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      expect(toast.success).toHaveBeenCalledWith('Magic link sent! Check your email.');
    });

    it('should handle magic link request error', async () => {
      const email = 'test@example.com';
      const errorMessage = 'Network error';
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.handleEmailAuth(email);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to send magic link',
        expect.objectContaining({ description: errorMessage })
      );
    });

    it('should validate email format', async () => {
      const invalidEmail = 'invalid-email';
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.handleEmailAuth(invalidEmail);
      });

      expect(mockSupabase.auth.signInWithOtp).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        'Invalid email',
        expect.objectContaining({ description: 'Please enter a valid email address' })
      );
    });
  });

  describe('Google OAuth', () => {
    it('should initiate Google OAuth flow', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: {}, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
    });

    it('should handle Google OAuth error', async () => {
      const errorMessage = 'OAuth failed';
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Google sign-in failed',
        expect.objectContaining({ description: errorMessage })
      );
    });
  });

  describe('Password Reset', () => {
    it('should handle successful password reset', async () => {
      const email = 'test@example.com';
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.handlePasswordReset(email);
      });

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      expect(toast.success).toHaveBeenCalledWith('Password reset email sent!');
    });

    it('should handle password reset error', async () => {
      const email = 'test@example.com';
      const errorMessage = 'User not found';
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.handlePasswordReset(email);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to send reset email',
        expect.objectContaining({ description: errorMessage })
      );
    });
  });

  describe('Invitation Handling', () => {
    it('should validate invitation token', async () => {
      const token = 'valid-token-123';
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'invite-123', clinic_id: 'clinic-123' },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const isValid = await result.current.handleInvite(token);
        expect(isValid).toBe(true);
      });
    });

    it('should handle invalid invitation token', async () => {
      const token = 'invalid-token';
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invitation not found' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const isValid = await result.current.handleInvite(token);
        expect(isValid).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Invalid invitation',
        expect.objectContaining({ description: 'Invitation not found or expired' })
      );
    });
  });

  describe('Session Management', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Signed out successfully');
    });

    it('should handle sign out error', async () => {
      const errorMessage = 'Sign out failed';
      mockSupabase.auth.signOut.mockResolvedValue({ error: { message: errorMessage } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to sign out',
        expect.objectContaining({ description: errorMessage })
      );
    });
  });
});