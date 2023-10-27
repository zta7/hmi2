import * as joint from '@clientio/rappid'

export const getTooltipConfig = () => {
  return {
    rootTarget: document.body,
    target: '[data-tooltip]',
    direction: joint.ui.Tooltip.TooltipArrowPosition.Auto,
    padding: 10
  }
}
