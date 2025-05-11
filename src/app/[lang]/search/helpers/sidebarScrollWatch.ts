import { Contents } from '@/search/definition/types';
import { EBreakpoints } from '../../../utils/BreakPoints';
import { useViewport } from '../../../use/useViewport';
import { Viewport } from '../../../services/Viewport';
import { cleanText } from '../../../utils/cleanText';

export const sidebarScrollWatch = (contents: Contents[], viewport: Viewport) => {
  let activeStep = 0;
  let activeStepDetailID = '';
  let detailIdForSelect = '';

  if (window.scrollY < 230) {
    const content = contents[0];
    activeStep = 0;
    activeStepDetailID = detailIdForSelect = cleanText(content.details[0].detailsId);
    return {
      activeStep,
      activeStepDetailID,
      detailIdForSelect,
    };
  }
  for (let i = 0; i < contents.length; i++) {
    const step = contents[i];
    for (let j = 0; j < step?.details.length; j++) {
      const detail = step?.details[j];
      const detailBoundingRect = document.getElementById(detail.detailsId)?.getBoundingClientRect();
      if (
        detailBoundingRect?.top &&
        detailBoundingRect?.bottom &&
        detailBoundingRect.top < window.innerHeight &&
        detailBoundingRect.bottom > 10
      ) {
        activeStep = i;
        activeStepDetailID = detailIdForSelect = cleanText(detail?.detailsId);
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
      activeStep = i;
      detailIdForSelect = cleanText(step.details[0].detailsId);
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
      activeStepDetailID = step.otherExamplesId;
      break;
    }
  }

  return {
    activeStep,
    activeStepDetailID,
    detailIdForSelect,
  };
};
