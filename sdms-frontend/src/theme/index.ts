import { extendTheme } from '@mui/material/styles';

import { themeOverrides } from './theme';

export const theme = extendTheme(themeOverrides as any);
