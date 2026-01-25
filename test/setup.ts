import { vi } from "vitest";

// Mock Nuxt auto-imports
global.defineEventHandler = (handler: unknown) => handler;
global.readBody = vi.fn();
global.getRouterParam = vi.fn();
global.createError = (error: { message: string }) => new Error(error.message);
global.useFetch = vi.fn();
global.useToast = vi.fn(() => ({
  add: vi.fn(),
}));
global.useRouter = vi.fn(() => ({
  push: vi.fn(),
}));
global.useRoute = vi.fn(() => ({
  query: {},
}));
global.useSeoMeta = vi.fn();
global.ref = (val: unknown) => ({ value: val });
global.computed = (fn: () => unknown) => ({ value: fn() });
global.onMounted = vi.fn();
global.onUnmounted = vi.fn();
