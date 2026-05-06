import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promoteEnvFile } from './promoteFile';

function writeTmp(name: string, content: string): string {
  const p = path.join(os.tmpdir(), `envpatch-promote-${Date.now()}-${name}`);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('promoteEnvFile', () => {
  it('promotes new keys from source into target file', () => {
    const src = writeTmp('source.env', 'API_URL=https://prod.example.com\nNEW_KEY=value\n');
    const tgt = writeTmp('target.env', 'API_URL=https://staging.example.com\nLOG_LEVEL=debug\n');
    const out = path.join(os.tmpdir(), `envpatch-promote-out-${Date.now()}.env`);

    const { result } = promoteEnvFile(src, tgt, out);

    expect(result.promoted['NEW_KEY']).toBeDefined();
    expect(result.skipped['API_URL']).toBe('already exists');

    const written = fs.readFileSync(out, 'utf-8');
    expect(written).toContain('NEW_KEY=value');
    expect(written).toContain('LOG_LEVEL=debug');
  });

  it('overwrites existing keys when overwrite option is set', () => {
    const src = writeTmp('source2.env', 'API_URL=https://prod.example.com\n');
    const tgt = writeTmp('target2.env', 'API_URL=https://staging.example.com\n');
    const out = path.join(os.tmpdir(), `envpatch-promote-out2-${Date.now()}.env`);

    const { result } = promoteEnvFile(src, tgt, out, { overwrite: true });

    expect(result.promoted['API_URL'].to).toBe('https://prod.example.com');
    const written = fs.readFileSync(out, 'utf-8');
    expect(written).toContain('https://prod.example.com');
  });

  it('does not write file in dryRun mode', () => {
    const src = writeTmp('source3.env', 'KEY=val\n');
    const tgt = writeTmp('target3.env', '');
    const out = path.join(os.tmpdir(), `envpatch-promote-dry-${Date.now()}.env`);

    promoteEnvFile(src, tgt, out, { dryRun: true });

    expect(fs.existsSync(out)).toBe(false);
  });

  it('creates target from scratch if target file is missing', () => {
    const src = writeTmp('source4.env', 'ONLY_KEY=hello\n');
    const tgt = path.join(os.tmpdir(), `envpatch-promote-missing-${Date.now()}.env`);
    const out = path.join(os.tmpdir(), `envpatch-promote-out4-${Date.now()}.env`);

    const { result } = promoteEnvFile(src, tgt, out);
    expect(result.promoted['ONLY_KEY']).toBeDefined();
    const written = fs.readFileSync(out, 'utf-8');
    expect(written).toContain('ONLY_KEY=hello');
  });
});
