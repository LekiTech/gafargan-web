'use client';

import * as React from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';

type ElevationScrollProps = {
  children: React.ReactElement;
};

export function ElevationScroll(props: ElevationScrollProps) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    // target, // window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}
