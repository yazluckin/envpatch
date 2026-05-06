import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { syncEnvFiles } from './syncFile';

function writeTmp(name: string, content: string): string {
  const filePath = path.join(os.tmpdir(), `envpatch-sync-${Date.now()}-${name}`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('syncEnvFiles', () => {
  it('syncs missing keys from left to right', () => {
    const leftPath = writeTmp('left.env', 'FOO=bar\nBAZ=qux\n');
    const rightPath = writeTmp('right.env', 'FOO=bar\n');

    const { result } = syncEnvFiles(leftPath, rightPath, { direction: 'right' });

    expect(result.changes.some(c => c.key === 'BAZ' && c.direction === 'right')).toBe(true);
    const written = fs.readFileSync(rightPath, 'utf-8');
    expect(written).toContain('BAZ=qux');
  });

  it('does not write files in dryRun mode', () => {
    const leftPath = writeTmp('left.env', 'FOO=bar\n');
    const rightPath = writeTmp('right.env', 'EXTRA=val\n');
    const originalLeft = fs.readFileSync(leftPath, 'utf-8');

    syncEnvFiles(leftPath, rightPath, { dryRun: true });

    expect(fs.readFileSync(leftPath, 'utf-8')).toBe(originalLeft);
  });

  it('creates right file if it does not exist', () => {
    const leftPath = writeTmp('left.env', 'NEW_KEY=hello\n');
    const rightPath = path.join(os.tmpdir(), `envpatch-sync-new-${Date.now()}.env`);

    syncEnvFiles(leftPath, rightPath, { direction: 'right' });

    expect(fs.existsSync(rightPath)).toBe(true);
    expect(fs.readFileSync(rightPath, 'utf-8')).toContain('NEW_KEY=hello');
    fs.unlinkSync(rightPath);
  });

  it('returns summary string', () => {
    const leftPath = writeTmp('left.env', 'A=1\n');
    const rightPath = writeTmp('right.env', 'B=2\n');

    const { summary } = syncEnvFiles(leftPath, rightPath);
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });
});
