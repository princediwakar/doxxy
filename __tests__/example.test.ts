import { mockPatient, mockAppointment, mockConsultation, mockBill } from './test-utils';

describe('Test Utilities', () => {
  test('mockPatient should have correct structure', () => {
    expect(mockPatient).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        gender: expect.any(String),
        age: expect.any(Number),
        clinic_id: expect.any(String),
      })
    );
  });

  test('mockAppointment should have correct structure', () => {
    expect(mockAppointment).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        clinic_id: expect.any(String),
        date: expect.any(String),
        patient_id: expect.any(String),
        doctor_id: expect.any(String),
        status: expect.any(String),
      })
    );
  });

  test('mockConsultation should have correct structure', () => {
    expect(mockConsultation).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        appointment_id: expect.any(String),
        patient_id: expect.any(String),
        specialty_data: expect.any(Object),
      })
    );
  });

  test('mockBill should have correct structure', () => {
    expect(mockBill).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        patient_id: expect.any(String),
        invoice_number: expect.any(String),
        amount: expect.any(Number),
        status: expect.any(String),
      })
    );
  });
});