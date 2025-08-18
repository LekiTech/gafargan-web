export const BUTTON_PASTEL_COLORS_BLUE = {
  bgcolor: 'rgb(220, 240, 250)',
  color: 'rgb(100, 125, 160)',
  '&:hover': {
    bgcolor: 'rgb(170, 205, 240)',
    color: 'rgb(60, 90, 130)',
  },
};

export const BUTTON_PASTEL_COLORS_PURPLE = {
  bgcolor: 'rgb(220, 215, 240)',
  color: 'rgb(130, 125, 165)',
  '&:hover': {
    bgcolor: 'rgb(190, 185, 250)',
    color: 'rgb(100, 95, 165)',
  },
};

export const BUTTON_PASTEL_COLORS_GREEN = {
  bgcolor: 'rgb(240, 250, 225)',
  color: 'rgb(170, 200, 145)',
  '&:hover': {
    bgcolor: 'rgb(215, 240, 180)',
    color: 'rgb(140, 200, 80)',
  },
};

export const INPUT_PASTEL_BEIGE = '#fffde799';

export const FORM_ENTRY_STATE = Object.freeze({
  NEW: 'new',
  EDIT: 'edit',
  VIEW: 'view',
});

export type FormEntryStateType = (typeof FORM_ENTRY_STATE)[keyof typeof FORM_ENTRY_STATE];
