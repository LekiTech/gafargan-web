import { useEffect, useState } from 'react';
import { Viewport } from '../services/Viewport';

export const useViewport = () => {
  const [viewport, setViewport] = useState(new Viewport(0));

  const handleResize = () => {
    setViewport(new Viewport(window.innerWidth))
  }

  useEffect(() => {
    if (!window) return;
    setViewport(new Viewport(window.innerWidth))
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { viewport }
}