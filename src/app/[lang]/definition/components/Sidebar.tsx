'use client';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Select,
  SelectChangeEvent,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  useScrollTrigger,
} from '@mui/material';
import { green, grey } from '@mui/material/colors';
import { colors } from '@/colors';
import Link from 'next/link';
import { Contents } from '../types';
import { FC, useEffect, useLayoutEffect, useState } from 'react';
import { useViewport } from '../../../use/useViewport';
import { EBreakpoints } from '../../../utils/BreakPoints';
import { sidebarScrollWatch } from '@/helpers/sidebarScrollWatch';
import { cleanText } from '../../../utils/cleanText';

type SidebarProps = {
  contents: Contents[];
  otherExamplesLabel: string;
};

const drawerWidth = 300;

export const Sidebar: FC<SidebarProps> = ({ contents, otherExamplesLabel }) => {

  const { viewport } = useViewport();

  const [activeStep, setActiveStep] = useState(0);
  const [activeStepDetailId, setActiveStepDetailId] = useState('');

  // вынес в отдельный стейт, не использую {activeStepDetailId} т.к. в select не показываем otherExamples
  const [activeStepDetailIdForSelect, setActiveStepDetailIdForSelect] = useState('')

  const trigger = useScrollTrigger({
    threshold: 10,
  });
  const [isScrolling, setIsScrolling] = useState(false);

  const [elementForScroll, setElementForScroll] = useState<HTMLElement>();

  // Отвечает за установку активного элемента навигации при скролле (докрутили до опр. слова, в навигации слово выделилось)
  useLayoutEffect(() => {
    const eventListener = () => {
      if (isScrolling) return;
      const { activeStep, activeStepDetailID, detailIdForSelect } = sidebarScrollWatch(contents, viewport)
      setActiveStep(activeStep);
      setActiveStepDetailId(activeStepDetailID)
      setActiveStepDetailIdForSelect(detailIdForSelect);
    }
    document.addEventListener('scroll', eventListener);
    return () => document.removeEventListener('scroll', eventListener);
  }, [contents, isScrolling]);


  // Отвечает за изменение состояния после скролла до элемента в моб. версии при выборе значения в селекте
  useEffect(() => {
    const handleScrolling = () => {
      setIsScrolling(false)
    }
    window.addEventListener('scrollend', handleScrolling);
    return () => window.removeEventListener('scrollend', handleScrolling);
  }, []);

  // При изменении isScrolling на след. тик выполняет нужную логику
  useLayoutEffect(() => {
    if (!elementForScroll || !isScrolling) return;
    elementForScroll.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [isScrolling]);


  const handleChangeSelect = async (event: SelectChangeEvent) => {
    const element = document.getElementById(event.target?.value);
    if (!element) return;
    setActiveStepDetailIdForSelect(event.target?.value);
    setElementForScroll(element)
    if (isScrolling) {
      setIsScrolling(false)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsScrolling(true)
  };


  const getBackgroundColor = (detailsId: string) =>
    activeStepDetailId === detailsId ? green[50] : 'inherit';

  if (viewport.isLessThan(EBreakpoints.XXL)) {
    return (
      <Select
        id="word-select"
        value={activeStepDetailIdForSelect}
        native
        sx={{
          position: 'fixed',
          borderRadius: 0,
          top: trigger ? '75px' : '200px',
          width: '100%',
          background: '#0f3b2e',
          color: '#fff',
          zIndex: 2,
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSelect-icon': {
            backgroundColor: '#fff',
          },
        }}
        onChange={handleChangeSelect}
      >
        {
          contents.map((c) => c.details.map((d) =>
          (<option
            key={d.detailsId}
            value={cleanText(d.detailsId)}
            style={{ background: '#0f3b2e' }}
          > {d.preview}</option>))
          )
        }
      </Select>
    )
  }
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
          height: 'calc(100vh - 250px)',
          // height: 'calc(100% - 150px)',
          // maxHeight: 'calc(100vh - 100px)',
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
                        href={`#${cleanText(d.detailsId)}`}
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
