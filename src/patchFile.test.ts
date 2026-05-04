import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { patchEnvFile } from './patchFile';

function writeTmp(name: string, content: string): string {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('patchEnvFile', () => {
  it('applies new keys from patch file to base file', () => {
    const base = writeTmp('base.env', 'EXISTING=yes\n');
    const patch = writeTmp('patch.env', 'EXISTING=yes\nNEW_VAR=hello\n');
    const out = path.join(os.tmpdir(), 'out.env');

    patchEnvFile(base, patch, { outputPath: out });

    const result = fs.readFileSync(out, 'utf-8');
    expect(result).toContain('NEW_VAR=hello');
    expect(result).toContain('EXISTING=yes');
  });

  it('does not overwrite changed keys by default', () => {
    const base = writeTmp('base2.env', 'KEY=original\n');
    const patch = writeTmp('patch2.env', 'KEY=modified\n');
    const out = path.join(os.tmpdir(), 'out2.env');

    patchEnvFile(base, patch, { outputPath: out });

    const result = fs.readFileSync(out, 'utf-8');
    expect(result).toContain('KEY=original');
  });

  it('overwrites changed keys when overwrite=true', () => {
    const base = writeTmp('base3.env', 'KEY=original\n');
    const patch = writeTmp('patch3.env', 'KEY=modified\n');
    const out = path.join(os.tmpdir(), 'out3.env');

    patchEnvFile(base, patch, { outputPath: out, overwrite: true });

    const result = fs.readFileSync(out, 'utf-8');
    expect(result).toContain('KEY=modified');
  });

  it('does not write file in dryRun mode', () => {
    const base = writeTmp('base4.env', 'KEY=value\n');
    const patch = writeTmp('patch4.env', 'KEY=value\nEXTRA=1\n');
    const out = path.join(os.tmpdir(), 'out4_dryrun.env');

    if (fs.existsSync(out)) fs.unlinkSync(out);

    const result = patchEnvFile(base, patch, { outputPath: out, dryRun: true });

    expect(fs.existsSync(out)).toBe(false);
    expect(result.applied).toContain('EXTRA');
  });

  it('throws if base file does not exist', () => {
    expect(() => patchEnvFile('/nonexistent/.env', '/tmp/patch.env')).toThrow(
      'Base file not found'
    );
  });

  it('throws if patch file does not exist', () => {
    const base = writeTmp('base5.env', 'KEY=value\n');
    expect(() => patchEnvFile(base, '/nonexistent/patch.env')).toThrow(
      'Patch file not found'
    );
  });
});
