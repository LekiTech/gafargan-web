import { EBreakpoints } from '../utils/BreakPoints';

export class Viewport {
  private readonly windowWidth: number = 0;

  constructor(windowWidth: number) {
    this.windowWidth = windowWidth;
  }

  get width() {
    return this.windowWidth
  }

  isGreaterThan(value: EBreakpoints) {
    return this.windowWidth > value;
  }

  isGreaterThanOrEquals(value: EBreakpoints) {
    return this.windowWidth >= value;
  }

  isLessThan(value: EBreakpoints) {
    return this.windowWidth < value;
  }

  isLessThanOrEquals(value: EBreakpoints) {
    return this.windowWidth <= value;
  }
}