import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// We need to import after mocking
import { apiClient } from './api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      apiClient.setToken('test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token');
    });
  });

  describe('setRefreshToken', () => {
    it('should store refresh token in localStorage', () => {
      apiClient.setRefreshToken('test-refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
    });
  });

  describe('clearTokens', () => {
    it('should remove both tokens from localStorage', () => {
      apiClient.clearTokens();
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('get', () => {
    it('should make a GET request with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
      });

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('should include authorization header when token exists', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
      });

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });

  describe('post', () => {
    it('should make a POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiClient.post('/test', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('error handling', () => {
    it('should throw error for non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Bad Request' }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Bad Request');
    });

    it('should redirect to auth on 401', async () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { href: '' } as any;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Sessão expirada');
      expect(window.location.href).toBe('/auth');

      window.location = originalLocation;
    });
  });
});
