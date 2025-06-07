-- Add policy for superadmins to add new clinic members
CREATE POLICY "Superadmins can add clinic members" ON clinic_members
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
); 