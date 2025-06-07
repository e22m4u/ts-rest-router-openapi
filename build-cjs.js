import * as esbuild from 'esbuild';
import packageJson from './package.json' with {type: 'json'};

await esbuild.build({
  entryPoints: ['dist/esm/index.js'],
  outfile: 'dist/cjs/index.cjs',
  format: 'cjs',
  platform: 'node',
  target: ['node12'],
  bundle: true,
  keepNames: true,
  external: [
    ...Object.keys(packageJson.peerDependencies || {}),
    ...Object.keys(packageJson.dependencies || {}),
  ],
});
