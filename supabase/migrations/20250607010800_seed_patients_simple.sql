-- Insert seed patients for testing (simplified version)
DO $$
DECLARE
    clinic_uuid UUID;
BEGIN
    -- Get the clinic ID (modify this to match your clinic name or use direct ID)
    SELECT id INTO clinic_uuid FROM clinics WHERE name = 'Neurovision' LIMIT 1;
    
    -- If clinic not found, skip seeding
    IF clinic_uuid IS NULL THEN
        RAISE NOTICE 'No clinic found with name "Neurovision". Please update the clinic name or use direct clinic ID.';
        RETURN;
    END IF;

    -- Insert seed patients (without conflict handling for simplicity)
    INSERT INTO patients (clinic_id, name, email, phone, date_of_birth, gender, address, medical_id) VALUES
    (clinic_uuid, 'John Smith', 'john.smith@email.com', '+1-555-0101', '1985-03-15', 'Male', '123 Main St, City, State 12345', 'PAT001'),
    (clinic_uuid, 'Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0102', '1990-07-22', 'Female', '456 Oak Ave, City, State 12345', 'PAT002'),
    (clinic_uuid, 'Michael Brown', 'michael.brown@email.com', '+1-555-0103', '1978-11-08', 'Male', '789 Pine Rd, City, State 12345', 'PAT003'),
    (clinic_uuid, 'Emily Davis', 'emily.davis@email.com', '+1-555-0104', '1992-01-30', 'Female', '321 Elm St, City, State 12345', 'PAT004'),
    (clinic_uuid, 'Robert Wilson', 'robert.wilson@email.com', '+1-555-0105', '1965-09-12', 'Male', '654 Maple Dr, City, State 12345', 'PAT005'),
    (clinic_uuid, 'Jessica Martinez', 'jessica.martinez@email.com', '+1-555-0106', '1988-04-18', 'Female', '987 Cedar Ln, City, State 12345', 'PAT006'),
    (clinic_uuid, 'David Anderson', 'david.anderson@email.com', '+1-555-0107', '1975-12-05', 'Male', '147 Birch Ave, City, State 12345', 'PAT007'),
    (clinic_uuid, 'Lisa Thompson', 'lisa.thompson@email.com', '+1-555-0108', '1993-06-25', 'Female', '258 Spruce St, City, State 12345', 'PAT008'),
    (clinic_uuid, 'Christopher Lee', 'chris.lee@email.com', '+1-555-0109', '1982-08-14', 'Male', '369 Willow Rd, City, State 12345', 'PAT009'),
    (clinic_uuid, 'Amanda White', 'amanda.white@email.com', '+1-555-0110', '1989-10-03', 'Female', '741 Aspen Dr, City, State 12345', 'PAT010'),
    (clinic_uuid, 'James Garcia', 'james.garcia@email.com', '+1-555-0111', '1970-02-28', 'Male', '852 Poplar Ave, City, State 12345', 'PAT011'),
    (clinic_uuid, 'Michelle Rodriguez', 'michelle.rodriguez@email.com', '+1-555-0112', '1987-05-16', 'Female', '963 Hickory St, City, State 12345', 'PAT012'),
    (clinic_uuid, 'Kevin Taylor', 'kevin.taylor@email.com', '+1-555-0113', '1984-09-07', 'Male', '159 Chestnut Ln, City, State 12345', 'PAT013'),
    (clinic_uuid, 'Jennifer Clark', 'jennifer.clark@email.com', '+1-555-0114', '1991-12-19', 'Female', '357 Walnut Rd, City, State 12345', 'PAT014'),
    (clinic_uuid, 'Daniel Lewis', 'daniel.lewis@email.com', '+1-555-0115', '1976-04-11', 'Male', '468 Sycamore Dr, City, State 12345', 'PAT015');

    RAISE NOTICE 'Successfully seeded % patients for clinic: %', 15, clinic_uuid;
    
EXCEPTION 
    WHEN others THEN
        RAISE NOTICE 'Error seeding patients: %', SQLERRM;
        RAISE NOTICE 'This might be due to duplicate data. Please check if patients already exist.';
END
$$; 