import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveRendererRoot } from './resolve-renderer-root.mjs';

test('prefers an explicit renderer root over workspace candidates', () =>
{
    const existing = new Set([ 'E:/custom/renderer', 'E:/workspace/renderer' ]);

    const result = resolveRendererRoot({
        explicitRoot: 'E:/custom/renderer',
        candidates: [ 'E:/workspace/renderer' ],
        exists: path => existing.has(path)
    });

    assert.equal(result, 'E:/custom/renderer');
});

test('uses the first existing workspace renderer when no override is configured', () =>
{
    const existing = new Set([ 'E:/Users/simol/Desktop/DEV/renderer' ]);

    const result = resolveRendererRoot({
        candidates: [
            'E:/Users/simol/Desktop/BETA/Nitro_Render_V3',
            'E:/Users/simol/Desktop/DEV/renderer'
        ],
        exists: path => existing.has(path)
    });

    assert.equal(result, 'E:/Users/simol/Desktop/DEV/renderer');
});
