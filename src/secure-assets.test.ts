import { afterEach, test, vi } from 'vitest';
import { expect } from 'vitest';

afterEach(() =>
{
    delete (window as unknown as { __nitroClientMode?: unknown }).__nitroClientMode;
    vi.resetModules();
});

test('resolves a root-relative plain config base against the current origin', async () =>
{
    (window as unknown as { __nitroClientMode: unknown }).__nitroClientMode = {
        distObfuscationEnabled: false,
        secureAssetsEnabled: false,
        secureApiEnabled: false,
        plainConfigBaseUrl: '/configuration/'
    };

    const { configFileUrl } = await import('./secure-assets');
    const resolved = new URL(configFileUrl('renderer-config.json'));

    expect(resolved.origin).toBe(window.location.origin);
    expect(resolved.pathname).toBe('/configuration/renderer-config.json');
});
