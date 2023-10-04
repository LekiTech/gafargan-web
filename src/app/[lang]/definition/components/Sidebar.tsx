'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { colors } from '@/colors';
import Link from 'next/link';
import { Contents } from '../types';

type SidebarProps = {
  contents: Contents[];
  otherExamplesLabel: string;
};

const drawerWidth = 300;

export const Sidebar: React.FC<SidebarProps> = ({ contents, otherExamplesLabel }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [activeStepDetailId, setActiveStepDetailId] = React.useState('');

  React.useEffect(() => {
    const eventListener = () => {
      for (let i = 0; i < contents.length; i++) {
        const step = contents[i];
        for (let j = 0; j < step.details.length; j++) {
          const detail = step.details[j];
          const detailBoundingRect = document
            .getElementById(detail.detailsId)
            ?.getBoundingClientRect();
          if (
            detailBoundingRect?.top &&
            detailBoundingRect?.bottom &&
            detailBoundingRect.top < window.innerHeight &&
            detailBoundingRect.bottom > 250
          ) {
            setActiveStep(i);
            setActiveStepDetailId(detail.detailsId);
            break;
          }
        }
        const boundingRect = document.getElementById(step.spellingId)?.getBoundingClientRect();
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
  }, [contents]);

  const getBackgroundColor = (detailsId: string) =>
    activeStepDetailId === detailsId ? red[50] : 'inherit';
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        // flexShrink: 0,
        '& .MuiDrawer-paper': {
          backgroundColor: colors.background,
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'sticky',
          top: '100px',
          height: '100%',
          maxHeight: 'calc(100vh - 100px)',
        },
      }}
      variant="permanent"
      // anchor="left"
    >
      {/* <Toolbar sx={{ p: '10px' }} />
      <Divider /> */}
      <Box sx={{ display: 'flex', justifyContent: 'start', pt: '25px' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {contents.map((step, index) => (
            <Step key={`step-${step.spellingId}-${index}`}>
              <StepLabel
                sx={{
                  '.MuiStepIcon-root.Mui-active': { color: colors.secondary },
                  '.MuiStepIcon-root.Mui-completed': { color: colors.primary },
                }}
                optional={
                  step.inflection ? (
                    <Typography variant="caption">{step.inflection}</Typography>
                  ) : null
                }
              >
                <Link
                  href={`#${step.spellingId}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Typography variant="h6">{step.spelling}</Typography>
                </Link>
              </StepLabel>
              <StepContent>
                {/* <Typography>{step.description}</Typography> */}
                <List sx={{ width: '100%' }}>
                  {step.details.map((d, stepDetailsIdx) => (
                    <ListItem key={`step-${d.detailsId}`}>
                      <ListItemButton
                        component="a"
                        href={`#${d.detailsId}`}
                        sx={{
                          backgroundColor: getBackgroundColor(d.detailsId),
                          // backgroundColor:
                          //   activeStepDetailId === d.detailsId ? colors.primary : 'inherit',
                          borderTopRightRadius: '100px',
                          borderBottomRightRadius: '100px',
                        }}
                      >
                        <ListItemText
                          sx={{
                            color:
                              activeStepDetailId === d.detailsId ? colors.secondary : 'inherit',
                            // backgroundColor: getBackgroundColor(d.detailsId),
                            // color: activeStepDetailId === d.detailsId ? '#fff' : 'inherit',
                            // backgroundColor:
                            //   activeStepDetailId === d.detailsId ? colors.secondary : 'inherit',
                            '.MuiListItemText-primary': {
                              // fontWeight: activeStepDetailId === d.detailsId ? 'bold' : 'inherit',
                              // fontSize: '1.1rem',
                            },
                            // borderLeft:
                            //   activeStepDetailId === d.detailsId
                            //     ? `1px solid ${colors.secondary}`
                            //     : 'inherit',
                            // '.MuiListItemText-secondary': {
                            //   color:
                            //     activeStepDetailId === d.detailsId ? colors.secondary : 'inherit',
                            // },
                          }}
                          primary={`${stepDetailsIdx + 1}. ${d.preview}`} //{`Definitions (${d.definitionsCount})\nExamples (${d.examplesCount})`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {step.otherExamplesId && step.otherExamplesCount > 0 && (
                    <ListItem key={`step-${step.otherExamplesId}`}>
                      <ListItemButton
                        component="a"
                        href={`#${step.otherExamplesId}`}
                        sx={{
                          backgroundColor: getBackgroundColor(step.otherExamplesId),
                          borderTopRightRadius: '100px',
                          borderBottomRightRadius: '100px',
                        }}
                      >
                        <ListItemText
                          sx={{
                            color:
                              activeStepDetailId === step.otherExamplesId
                                ? colors.secondary
                                : 'inherit',
                          }}
                          primary={`${otherExamplesLabel} (${step.otherExamplesCount})`} //{`Definitions (${d.definitionsCount})\nExamples (${d.examplesCount})`}
                        />
                      </ListItemButton>
                    </ListItem>
                  )}
                </List>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Drawer>
  );
};
