import * as path from 'path';
import Mocha = require('mocha');
import { promisify } from 'util';
import type { GlobOptions } from 'glob';

const glob = require('glob');

const globAsync = promisify(glob) as (pattern: string, options: GlobOptions) => Promise<string[]>;

export async function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', color: true });
  const testsRoot = path.resolve(__dirname);

  try {
    const files = await globAsync('**/*.test.js', { cwd: testsRoot });

    files.forEach((file: string) => mocha.addFile(path.resolve(testsRoot, file)));

    return new Promise<void>((resolve, reject) => {
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}
