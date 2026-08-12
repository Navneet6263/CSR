import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'import/no-anonymous-default-export': 'off',
      // React Compiler is not enabled; retain runtime hook correctness rules
      // while allowing established client-side loading and presentation patterns.
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'public/pdf.worker.min.mjs', 'next-env.d.ts']),
]);
