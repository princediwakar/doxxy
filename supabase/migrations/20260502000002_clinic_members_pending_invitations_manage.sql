-- Allow authenticated clinic members to manage pending_invitations for their clinics
-- Needed for: removeMemberMutation cleanup, and edge function operations via user auth

-- DELETE: clinic members can remove stale invitations for their clinic
CREATE POLICY "pending_invitations_clinic_members_delete" ON public.pending_invitations
FOR DELETE
TO authenticated
USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR public.is_superadmin()
);

-- INSERT: clinic members can create invitations for their clinic
CREATE POLICY "pending_invitations_clinic_members_insert" ON public.pending_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR public.is_superadmin()
);

-- UPDATE: clinic members can refresh invitations for their clinic (token, expiry, accepted_at)
CREATE POLICY "pending_invitations_clinic_members_update" ON public.pending_invitations
FOR UPDATE
TO authenticated
USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR public.is_superadmin()
)
WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR public.is_superadmin()
);
