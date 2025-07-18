import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface MenuItem {
  title: string;
  action: () => void;
}

interface MenuButtonProps {
  items: MenuItem[];
}

const ITEM_HEIGHT = 48;

// TODO: replace some buttons on the UI with this

export const MenuButton: React.FC<MenuButtonProps> = ({ items }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuSelect = (menuItemAction: () => void) => {
    menuItemAction();
    handleClose();
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '20ch',
            },
          },
          list: {
            'aria-labelledby': 'long-button',
          },
        }}
      >
        {items.map((item, i) => {
          const key = `${item.title}_${i}`;
          return (
            <MenuItem key={key} onClick={() => handleMenuSelect(item.action)}>
              {item.title}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};
