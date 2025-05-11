import { Box, Slide, SxProps, useMediaQuery, useScrollTrigger, useTheme } from "@mui/material";

type Props = {
  children: React.ReactElement;
}

export function HideOnScroll(props: Props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    threshold: 0,
  });
  const theme = useTheme();
  const isSmallerThanMd = useMediaQuery(theme.breakpoints.down('md'));

  // if (isSmallerThanMd) {
  //   return (
  //     <Slide appear={false} direction="down" in={!trigger}>
  //       {children}
  //     </Slide >
  //   );
  // } else {
  //   return (children);
  // }
  const positioning: SxProps = trigger ? {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
  } : {};
  return (
    <Box
      sx={{
        ...positioning,
        transform: trigger ? 'translateY(-50%)' : 'translateY(0)',
        transition: theme.transitions.create('transform', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        zIndex: theme.zIndex.appBar,
      }}
    >
      {children}
    </Box>
  );
}