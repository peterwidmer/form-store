// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

export default [
  {
	  input: 'src/form-store.ts',
	  output: {
		dir: 'dist',
		format: 'es'
	  },
	  plugins: [typescript()]
  },
  {
	  input: 'dist/dts/form-store.d.ts',
	  output: {
		file: 'dist/form-store.d.ts',
		format: 'es'
	  },
	  plugins: [dts()]
  }
];