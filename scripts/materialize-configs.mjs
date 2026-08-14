#!/usr/bin/env node
import { copyFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, '..');

const readJsonMode = async (root) =>
{
    try
    {
        const buildConfig = JSON.parse(await readFile(resolve(root, '.nitro-build.json'), 'utf8'));
        return buildConfig.jsonMode === 'legacy' ? 'legacy' : 'jsonc';
    }
    catch
    {
        return 'jsonc';
    }
};

export const materializeConfigs = async (root = DEFAULT_ROOT) =>
{
    const configurationDir = resolve(root, 'public', 'configuration');
    const jsonMode = await readJsonMode(root);
    const mappings = [
        {
            target: 'renderer-config.json',
            source: jsonMode === 'legacy'
                ? 'renderer-config.json.example.json'
                : 'renderer-config..jsonc.example.json'
        },
        { target: 'ui-config.json', source: 'ui-config.example' },
        { target: 'client-mode.json', source: 'client-mode.example' }
    ];
    const created = [];

    for(const { target, source } of mappings)
    {
        const targetPath = resolve(configurationDir, target);
        if(existsSync(targetPath)) continue;

        const sourcePath = resolve(configurationDir, source);
        if(!existsSync(sourcePath)) throw new Error(`Missing configuration template: ${ sourcePath }`);

        await copyFile(sourcePath, targetPath);
        created.push(target);
    }

    return created;
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if(isCli)
{
    const created = await materializeConfigs();
    process.stdout.write(created.length
        ? `[materialize-configs] created ${ created.join(', ') }\n`
        : '[materialize-configs] runtime configs already exist\n');
}
