import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules', 'build'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node, // Bổ sung môi trường node để không báo lỗi ở các file config hệ thống
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin, 
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.json'],
        },
      },
    },
    rules: {
      // 1. Core rules khuyến nghị của ESLint và React Hooks
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // 2. TỐI ƯU: Đồng bộ triệt để luật format với file .prettierrc
      ...prettierConfig.rules,
      'prettier/prettier': 'error', // Báo lỗi đỏ ngay lập tức nếu code sai định dạng prettier

      // 3. Quản lý xuất/nhập linh kiện (React Refresh)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // 4. TỐI ƯU: Thắt chặt an toàn mã nguồn, triệt tiêu biến "mồ côi"
      'no-unused-vars': [
        'error',
        { 
          vars: 'all', 
          args: 'after-used', 
          ignoreRestSiblings: true 
        }
      ],

      // 5. Bắt buộc kiểm tra đường dẫn Absolute Import (@/) chuẩn chỉnh
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      
      // TỰ ĐỘNG: Cảnh báo nếu import lộn xộn, ép sắp xếp theo thứ tự thư viện -> alias @/
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];