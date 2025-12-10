// Simple test to verify Jest setup works
describe('Simple test', () => {
  test('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  test('mock data should work', () => {
    const mockData = {
      id: 'test-123',
      name: 'Test',
    };

    expect(mockData).toEqual({
      id: 'test-123',
      name: 'Test',
    });
  });
});