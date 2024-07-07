'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
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
import { red, grey, green } from '@mui/material/colors';
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
        for (let j = 0; j < step?.details.length; j++) {
          const detail = step?.details[j];
          const detailBoundingRect = document
            .getElementById(detail.detailsId)
            ?.getBoundingClientRect();
          if (
            detailBoundingRect?.top &&
            detailBoundingRect?.bottom &&
            detailBoundingRect.top < window.innerHeight &&
            detailBoundingRect.bottom > 50
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
        const exampleBoundingRect = document
          .getElementById(step.otherExamplesId)
          ?.getBoundingClientRect();
        if (
          exampleBoundingRect?.top &&
          exampleBoundingRect?.bottom &&
          exampleBoundingRect.top < window.innerHeight &&
          exampleBoundingRect.bottom > 0
        ) {
          setActiveStepDetailId(step.otherExamplesId);
          break;
        }
      }
    };
    document.addEventListener('scroll', eventListener);
    return () => document.removeEventListener('scroll', eventListener);
  }, [contents]);

  const getBackgroundColor = (detailsId: string) =>
    activeStepDetailId === detailsId ? green[50] : 'inherit';
  return (
    <Drawer
      sx={(theme) => ({
        [theme.breakpoints.down('md')]: {
          display: 'none',
        },
        display: 'block',
        width: drawerWidth,
        height: 'calc(100% - 150px)',
        // flexShrink: 0,
        '& .MuiDrawer-paper': {
          ml: '24px',
          backgroundColor: colors.background,
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'sticky',
          top: '150px',
          height: 'calc(100% - 150px)',
          maxHeight: 'calc(100vh - 100px)',
        },
      })}
      variant="permanent"
    // anchor="left"
    >
      {/* <Toolbar sx={{ p: '10px' }} />
      <Divider /> */}
      <Box sx={{ display: 'flex', justifyContent: 'start', pt: '25px' }}>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{ '.MuiStepContent-root': { pl: 0 } }}
        >
          {contents.map((step, index) => (
            <Step key={`step-${step.spellingId}-${index}`}>
              <StepLabel
                sx={{
                  '.MuiStepIcon-root.Mui-active': { color: colors.secondary },
                  '.MuiStepIcon-root.Mui-completed': { color: colors.primary },
                  '.MuiStepLabel-iconContainer': { mt: '5px' },
                  alignItems: 'flex-start',
                }}
                optional={
                  step.inflection ? (
                    <Typography variant="caption">{step.inflection}</Typography>
                  ) : null
                }
              >
                <Link href={`#${step.spellingId}`} style={{ textDecoration: 'none' }}>
                  <Typography sx={{ fontWeight: 'bold', color: grey[800] }} variant="h6">
                    {step.spelling}
                  </Typography>
                </Link>
              </StepLabel>
              <StepContent>
                {/* <Typography>{step.description}</Typography> */}
                <List sx={{ width: '100%' }}>
                  {step?.details?.map((d, stepDetailsIdx) => (
                    <ListItem
                      key={`step-${d.detailsId}`}
                      sx={{ pt: 0, pb: 0, '&.MuiListItem-root': { pl: 0 } }}
                    >
                      <ListItemButton
                        component="a"
                        href={`#${d.detailsId}`}
                        sx={{
                          backgroundColor: getBackgroundColor(d.detailsId),

                          // backgroundColor:
                          //   activeStepDetailId === d.detailsId ? colors.primary : 'inherit',
                          borderTopRightRadius: '100px',
                          borderBottomRightRadius: '100px',
                          '&.MuiListItemButton-root': {
                            pt: '4px',
                            pb: '4px',
                            pl: 0,
                            // ml: '16px',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '2px',
                            height: '100%',
                            mt: 0,
                            mb: 0,
                            backgroundColor:
                              activeStepDetailId === d.detailsId ? grey[700] : 'none',
                            borderTopRightRadius: '10px',
                            borderBottomRightRadius: '10px',
                          }}
                        ></Box>
                        <Box
                          sx={{
                            width: '7px',
                            height: '14px',
                            backgroundColor:
                              activeStepDetailId === d.detailsId ? grey[700] : 'none',
                            borderTopRightRadius: '10px',
                            borderBottomRightRadius: '10px',
                          }}
                        ></Box>
                        <ListItemText
                          sx={{
                            marginLeft: '24px',
                            color:
                              activeStepDetailId === d.detailsId ? colors.primaryTint : grey[700],
                            // backgroundColor: getBackgroundColor(d.detailsId),
                            // color: activeStepDetailId === d.detailsId ? '#fff' : 'inherit',
                            // backgroundColor:
                            //   activeStepDetailId === d.detailsId ? colors.secondary : 'inherit',
                            '.MuiListItemText-primary': {
                              fontWeight: 'bold',
                              // fontWeight: activeStepDetailId === d.detailsId ? 'bold' : 'inherit',
                              fontSize: '14px',
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
                          primary={`${stepDetailsIdx + 1}. ${d.preview.toUpperCase()}`} //{`Definitions (${d.definitionsCount})\nExamples (${d.examplesCount})`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {step.otherExamplesId && step.otherExamplesCount > 0 && (
                    <ListItem key={`step-${step.otherExamplesId}`} sx={{ pt: 0, pb: 0 }}>
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
                                ? colors.primary
                                : grey[700],
                            '.MuiListItemText-primary': {
                              fontWeight: 'bold',
                            },
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
