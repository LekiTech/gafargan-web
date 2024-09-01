import { Contents } from '@/definition/types';

export const sidebarScrollWatch = (contents: Contents[]) => {
  let activeStep = 0;
  let activeStepDetailID = '';

  if (window.scrollY < 230) {
    activeStep = 0;
    activeStepDetailID = contents[0].details[0].detailsId;
    return {
      activeStep,
      activeStepDetailID
    }
  }
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
        detailBoundingRect.bottom > 10
      ) {
        activeStep = i;
        activeStepDetailID = detail.detailsId;
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
      activeStepDetailID = step.otherExamplesId
      break;
    }
  }

  return {
    activeStep,
    activeStepDetailID
  }
};