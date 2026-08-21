import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Without `test.globals: true` in vite.config.ts, RTL can't see a global `afterEach`
// to auto-register its cleanup, so each rendered tree would otherwise leak into the
// next test's DOM — do it explicitly instead.
afterEach(() => {
  cleanup();
});
