import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { materializeConfigs } from './materialize-configs.mjs';

const withFixture = async (callback) =>
{
    const root = await mkdtemp(join(tmpdir(), 'darkui-config-'));
    const configurationDir = join(root, 'public', 'configuration');
    await mkdir(configurationDir, { recursive: true });

    try
    {
        await callback({ root, configurationDir });
    }
    finally
    {
        await rm(root, { recursive: true, force: true });
    }
};

test('materializes the JSONC renderer config and required runtime configs', async () =>
{
    await withFixture(async ({ root, configurationDir }) =>
    {
        await writeFile(join(root, '.nitro-build.json'), '{"jsonMode":"jsonc"}\n');
        await writeFile(join(configurationDir, 'renderer-config..jsonc.example.json'), '{\n  // local\n  "socket.url": "ws://localhost:2096",\n}\n');
        await writeFile(join(configurationDir, 'renderer-config.json.example.json'), '{"socket.url":"wss://example.com"}\n');
        await writeFile(join(configurationDir, 'ui-config.example'), '{"theme":"darkui"}\n');
        await writeFile(join(configurationDir, 'client-mode.example'), '{"secureAssetsEnabled":false}\n');

        const created = await materializeConfigs(root);

        assert.deepEqual(created.sort(), [ 'client-mode.json', 'renderer-config.json', 'ui-config.json' ]);
        assert.match(await readFile(join(configurationDir, 'renderer-config.json'), 'utf8'), /\/\/ local/);
        assert.equal(await readFile(join(configurationDir, 'ui-config.json'), 'utf8'), '{"theme":"darkui"}\n');
        assert.equal(await readFile(join(configurationDir, 'client-mode.json'), 'utf8'), '{"secureAssetsEnabled":false}\n');
    });
});

test('preserves existing local runtime configs', async () =>
{
    await withFixture(async ({ root, configurationDir }) =>
    {
        await writeFile(join(root, '.nitro-build.json'), '{"jsonMode":"legacy"}\n');
        await writeFile(join(configurationDir, 'renderer-config.json.example.json'), '{"source":"example"}\n');
        await writeFile(join(configurationDir, 'ui-config.example'), '{"source":"example"}\n');
        await writeFile(join(configurationDir, 'client-mode.example'), '{"source":"example"}\n');
        await writeFile(join(configurationDir, 'renderer-config.json'), '{"source":"custom"}\n');

        const created = await materializeConfigs(root);

        assert.deepEqual(created.sort(), [ 'client-mode.json', 'ui-config.json' ]);
        assert.equal(await readFile(join(configurationDir, 'renderer-config.json'), 'utf8'), '{"source":"custom"}\n');
    });
});
