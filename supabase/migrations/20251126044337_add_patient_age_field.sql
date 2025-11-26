-- Add age field to patients table and handle transition from date_of_birth

-- Step 1: Add age column to patients table
ALTER TABLE patients
ADD COLUMN age integer NULL;

-- Step 2: Create a function to calculate age from date_of_birth
CREATE OR REPLACE FUNCTION calculate_age_from_dob(dob_string text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    dob_date date;
    age_years integer;
BEGIN
    -- Handle null or empty date_of_birth
    IF dob_string IS NULL OR dob_string = '' THEN
        RETURN NULL;
    END IF;

    -- Convert string to date (assuming format 'yyyy-MM-dd')
    BEGIN
        dob_date := dob_string::date;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN NULL; -- Return null if date format is invalid
    END;

    -- Calculate age in years
    age_years := EXTRACT(YEAR FROM age(current_date, dob_date));

    RETURN age_years;
END;
$$;

-- Step 3: Backfill age for existing patients
UPDATE patients
SET age = calculate_age_from_dob(date_of_birth)
WHERE date_of_birth IS NOT NULL AND date_of_birth != '';

-- Step 4: Create a trigger to automatically calculate age when date_of_birth is updated
CREATE OR REPLACE FUNCTION update_patient_age()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calculate age from date_of_birth when it's provided
    IF NEW.date_of_birth IS NOT NULL AND NEW.date_of_birth != '' THEN
        NEW.age := calculate_age_from_dob(NEW.date_of_birth);
    ELSE
        NEW.age := NULL;
    END IF;

    RETURN NEW;
END;
$$;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS trigger_update_patient_age ON patients;
CREATE TRIGGER trigger_update_patient_age
    BEFORE INSERT OR UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_age();

-- Step 6: Add constraint to ensure age is positive and reasonable
ALTER TABLE patients
ADD CONSTRAINT age_reasonable_range
CHECK (age IS NULL OR (age >= 0 AND age <= 150));

-- Step 7: Update RLS policies if needed (age field inherits same policies as other patient fields)
-- Note: RLS policies already cover the patients table, so age field will be automatically covered

-- Step 8: Create index for age queries if needed
CREATE INDEX IF NOT EXISTS idx_patients_age ON patients(age) WHERE age IS NOT NULL;