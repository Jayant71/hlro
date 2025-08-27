// Unit tests for geocodingService.js
import { geocodeAddress } from '../geocodingService';

jest.mock('node-fetch', () => jest.fn());
import fetch from 'node-fetch';

describe('geocodeAddress', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it('should return coordinates for a valid address', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '12.34', lon: '56.78' }]
    });
    const result = await geocodeAddress('Valid Address');
    expect(result).toEqual({ lat: 12.34, lon: 56.78 });
  });

  it('should throw error for empty address', async () => {
    await expect(geocodeAddress('')).rejects.toThrow('Invalid address');
    await expect(geocodeAddress(null)).rejects.toThrow('Invalid address');
  });

  it('should throw error if address not found', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });
    await expect(geocodeAddress('Unknown Place')).rejects.toThrow('Address not found');
  });

  it('should throw error if fetch fails', async () => {
    fetch.mockRejectedValue(new Error('Network error'));
    await expect(geocodeAddress('Any Address')).rejects.toThrow('Failed to connect to geocoding service');
  });

  it('should throw error if response is not ok', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({})
    });
    await expect(geocodeAddress('Any Address')).rejects.toThrow('Geocoding service error: 500');
  });

  it('should use cache for repeated requests', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '1', lon: '2' }]
    });
    const first = await geocodeAddress('Cached Address');
    fetch.mockClear();
    const second = await geocodeAddress('Cached Address');
    expect(second).toEqual(first);
    expect(fetch).not.toHaveBeenCalled();
  });
});