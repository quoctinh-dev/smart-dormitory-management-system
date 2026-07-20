import { PaperProps, Theme, paperClasses } from '@mui/material';
import { Components } from '@mui/material/styles';

import { blue, grey } from '@/theme/palette/colors';

declare module '@mui/material' {
  interface PaperPropsVariantOverrides {
    default: true;
  }

  interface PaperOwnProps {
    background?: 1 | 2 | 3 | 4 | 5;
  }
}

const backgrounds: { [key: number]: { [key: string]: string } } = {
  1: { light: grey[50], dark: grey[900] },
  2: { light: grey[100], dark: grey[800] },
  3: { light: grey[200], dark: grey[700] },
  4: { light: grey[300], dark: grey[600] },
  5: { light: blue[50], dark: blue[950] },
};

const backgroundVariants = Object.keys(backgrounds).map((background) => ({
  props: { background: Number(background) as PaperProps['background'] },
  style: ({ theme }: { theme: Theme }) => [
    theme.applyStyles('light', {
      [`&.${paperClasses.root}`]: {
        backgroundColor: backgrounds[Number(background)].light,
      },
    }),
    theme.applyStyles('dark', {
      [`&.${paperClasses.root}`]: {
        backgroundColor: backgrounds[Number(background)].dark,
      },
    }),
  ],
}));

const Paper: Components<Omit<Theme, 'components'>>['MuiPaper'] = {
  variants: [
    {
      props: { variant: 'default' },
      style: ({ theme }) => ({
        border: 'none',
      }),
    },
    ...backgroundVariants,
  ],
  defaultProps: {
    variant: 'default',
    elevation: 3,
  },
  styleOverrides: {
    elevation: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.paper,
      backgroundImage: 'none',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: theme.vars.palette.divider,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      borderRadius: 16,
      ...theme.applyStyles('dark', {
        borderWidth: 1,
        boxShadow: 'none',
      }),
    }),
    outlined: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.paper,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.vars.palette.divider,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
      borderRadius: 16,
      ...theme.applyStyles('dark', {
        boxShadow: 'none',
      }),
    }),
    rounded: {
      borderRadius: 16,
    },
  },
};

export default Paper;
