-- Enable RLS on doctors table
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow a user to read their own doctor profile
CREATE POLICY "Users can read their own doctor profile"
  ON doctors
  FOR SELECT
  USING (
    id = auth.uid() OR user_id = auth.uid()
  );

-- Policy: Allow a user to update their own doctor profile
CREATE POLICY "Users can update their own doctor profile"
  ON doctors
  FOR UPDATE
  USING (
    id = auth.uid() OR user_id = auth.uid()
  );

-- Policy: Allow clinic members to read doctors in their clinic
CREATE POLICY "Clinic members can read doctors in their clinic"
  ON doctors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clinic_members
      WHERE clinic_members.user_id = auth.uid()
        AND clinic_members.clinic_id = doctors.clinic_id
    )
  ); 