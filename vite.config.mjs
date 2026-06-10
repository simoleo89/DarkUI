// vite.config.mjs
import react from '@vitejs/plugin-react';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// Consume the local Nitro_Render_V3 (2.1.0) working tree as the renderer SDK
// instead of npm-installed packages. The renderer is a sibling of this repo
// inside DEV/ (same layout Nitro-V3 / hubUI use). Aliasing every @nitrots/*
// sub-package to its source index keeps the renderer's internal cross-package
// imports resolvable, and pixi/howler are pinned to the renderer's own
// node_modules so there is exactly one PixiJS 8 instance.
const currentRendererRoot = resolve(__dirname, '..', 'renderer');
const legacyRendererRoot = resolve(__dirname, '..', 'Nitro_Render_V3');
const rendererRoot = existsSync(currentRendererRoot) ? currentRendererRoot : legacyRendererRoot;

if(!existsSync(rendererRoot))
{
    throw new Error(
        '\n  Nitro renderer SDK not found.\n\n' +
        '  Expected the Nitro_Render_V3 working tree next to darkui:\n' +
        `    ${ currentRendererRoot }\n\n` +
        '  Clone it as a sibling and run `yarn install` inside it.\n'
    );
}

export default defineConfig({
    plugins: [ react() ],
    // Pre-bundle the CJS/React-ecosystem deps up front in a single optimize pass.
    // Without this, Vite discovers them incrementally as components load and triggers
    // a full page reload on each new dep — which, combined with the large aliased
    // renderer source tree, makes the dev server thrash and never settle on first run.
    optimizeDeps: {
        include: [
            'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime',
            'react-bootstrap', 'react-draggable', 'react-slider', 'react-youtube',
            'react-use-websocket', 'react-icons', 'react-canvas-confetti', 'react-confetti',
            'react-countdown', 'axios', 'emoji-toolkit', 'use-between', 'usehooks-ts',
            '@tanstack/react-virtual', '@fortawesome/fontawesome-svg-core', '@fortawesome/react-fontawesome'
        ]
    },
    server: {
        host: '127.0.0.1',
        port: 5181,
        fs: {
            // Allow Vite to read the renderer working tree outside this repo's root.
            allow: [
                resolve(__dirname),
                rendererRoot
            ]
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '~': resolve(__dirname, 'node_modules'),
            // Umbrella barrel -> local compatibility shim (re-exports the real
            // renderer + the few 1.6.6 symbols 2.1.0 dropped). The real renderer
            // source index is reachable via '@nitrots/nitro-renderer-real'.
            '@nitrots/nitro-renderer-real': resolve(rendererRoot, 'index.ts'),
            '@nitrots/nitro-renderer': resolve(__dirname, 'src/nitro-renderer-compat.ts'),
            '@nitrots/api': resolve(rendererRoot, 'packages/api/src/index.ts'),
            '@nitrots/assets': resolve(rendererRoot, 'packages/assets/src/index.ts'),
            '@nitrots/avatar': resolve(rendererRoot, 'packages/avatar/src/index.ts'),
            '@nitrots/camera': resolve(rendererRoot, 'packages/camera/src/index.ts'),
            '@nitrots/communication': resolve(rendererRoot, 'packages/communication/src/index.ts'),
            '@nitrots/configuration': resolve(rendererRoot, 'packages/configuration/src/index.ts'),
            '@nitrots/events': resolve(rendererRoot, 'packages/events/src/index.ts'),
            '@nitrots/localization': resolve(rendererRoot, 'packages/localization/src/index.ts'),
            '@nitrots/room': resolve(rendererRoot, 'packages/room/src/index.ts'),
            '@nitrots/session': resolve(rendererRoot, 'packages/session/src/index.ts'),
            '@nitrots/sound': resolve(rendererRoot, 'packages/sound/src/index.ts'),
            '@nitrots/utils/src': resolve(rendererRoot, 'packages/utils/src'),
            '@nitrots/utils': resolve(rendererRoot, 'packages/utils/src/index.ts'),
            'pixi.js': resolve(__dirname, 'node_modules/pixi.js'),
            'pixi-filters': resolve(__dirname, 'node_modules/pixi-filters'),
            'howler': resolve(__dirname, 'node_modules/howler')
        }
    },
    build: {
        assetsInlineLimit: 102400,
        rollupOptions: {
            output: {
                assetFileNames: 'src/assets/[name].[ext]',
                manualChunks: id =>
                {
                    const norm = id.replace(/\\/g, '/');

                    if(norm.includes('/pixi.js/') || norm.includes('/pixi-filters/')) return 'vendor-pixi';
                    if(norm.includes('/Nitro_Render_V3/') || norm.includes('/renderer/')) return 'nitro-renderer';

                    if(norm.includes('node_modules'))
                    {
                        if(norm.includes('@nitrots/nitro-renderer')) return 'nitro-renderer';

                        return 'vendor';
                    }
                }
            }
        }
    }
});
