'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Stepper, Step, StepLabel } from '@mui/material';
import { colors } from '@/colors';
import Link from 'next/link';

const steps = [
  {
    id: 'noun', // 'существительное',
    label: 'Существитеьное',
    description: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
  },
  {
    id: 'adjective', // 'прилагательное
    label: 'Прилагательное',
    description: 'An ad group contains one or more ads which target a shared set of keywords.',
  },
  {
    id: 'examples', // 'примеры',
    label: 'Примеры',
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
];

const drawerWidth = 300;

export const Sidebar: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const eventListener = () => {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const boundingRect = document.getElementById(step.id)?.getBoundingClientRect();
        if (
          boundingRect?.top &&
          boundingRect?.bottom &&
          boundingRect.top < window.innerHeight &&
          boundingRect.bottom > 0
        ) {
          setActiveStep(i);
          break;
        }
      }
    };
    document.addEventListener('scroll', eventListener);
    return () => document.removeEventListener('scroll', eventListener);
  }, []);

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          backgroundColor: colors.background,
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar sx={{ p: '10px' }} />
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: '25px' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                sx={{
                  '.MuiStepIcon-root.Mui-active': { color: colors.secondary },
                  '.MuiStepIcon-root.Mui-completed': { color: colors.primary },
                }}
                // optional={index === 2 ? <Typography variant="caption">Last step</Typography> : null}
              >
                <Link href={`#${step.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Typography variant="h6">{step.label}</Typography>
                </Link>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Drawer>
  );
};
