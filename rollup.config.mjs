// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/form-store.ts',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [typescript()]
};