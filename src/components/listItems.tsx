import ListItem from '@mui/material/ListItem';
import * as React from 'react';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddChartIcon from '@mui/icons-material/Addchart';

export const mainListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AddChartIcon />
      </ListItemIcon>
      <ListItemText primary="New Order" />
    </ListItem>
  </div>
);
