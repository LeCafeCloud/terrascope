import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => cleanup());

const mockFn = vi.fn();

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockFn.mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

globalThis.fetch = mockFn;

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    createRadialGradient: () => ({ addColorStop: mockFn }),
    fillRect: mockFn,
    clearRect: mockFn,
    beginPath: mockFn,
    arc: mockFn,
    fill: mockFn,
    stroke: mockFn,
});

