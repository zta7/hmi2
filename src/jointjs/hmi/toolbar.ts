import * as joint from '@clientio/rappid'

export const getToolbarConfig = (
  paper: joint.dia.Paper,
  commandManager: joint.dia.CommandManager,
  paperScroller: joint.ui.PaperScroller,
  referenceSize: { width: number; height: number } = { width: 1920, height: 1080 },
) => {
  return {
    tools: [
      {
        // 自定义"重置视角"按钮：缩放到刚好容纳参考线框，并把视口中心对齐线框中心。
        // 不再使用 Rappid 内置 zoom-to-fit，否则它会走 fitToContent 把视口跳到内容 bbox，
        // 导致线框与重置视角的视觉中心不一致。
        type: 'button',
        name: 'reset-view',
        attrs: {
          button: {
            'data-tooltip': 'Reset View (zoom to reference frame)',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container'
          }
        }
      },
      {
        type: 'zoomIn',
        name: 'zoom-in',
        attrs: {
          button: {
            'data-tooltip': 'zoomIn',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container'
          }
        }
      },
      {
        type: 'zoomOut',
        name: 'zoom-out',
        attrs: {
          button: {
            'data-tooltip': 'zoomOut',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container'
          }
        }
      },
      {
        type: 'button',
        name: 'select-mode',
        attrs: {
          button: {
            'data-tooltip': 'Select Mode',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container',
            'data-active': 'true'
          }
        }
      },
      {
        type: 'button',
        name: 'pan-mode',
        attrs: {
          button: {
            'data-tooltip': 'Pan Mode (drag canvas)',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container'
          }
        }
      },
      {
        type: 'button',
        name: 'navigator-toggle',
        attrs: {
          button: {
            'data-tooltip': 'Toggle Navigator',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container',
            'data-active': 'true'
          }
        }
      },
      {
        type: 'button',
        name: 'reference-toggle',
        attrs: {
          button: {
            'data-tooltip': 'Toggle Reference Frame',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container',
            'data-active': 'true'
          }
        }
      },
      {
        type: 'undo',
        name: 'undo',
        attrs: {
          button: {
            'data-tooltip': 'undo(crtl+z)',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container'
          }
        }
      },
      {
        type: 'redo',
        name: 'redo',
        attrs: {
          button: {
            'data-tooltip': 'redo(crtl+y)',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container'
          }
        }
      },
      {
        type: 'button',
        name: 'copy',
        attrs: {
          button: {
            disabled: true,
            'data-tooltip': 'copy(crtl+c)',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container',
            background: 'url(/minus.svg)'

          }
        }
      },
      {
        type: 'button',
        name: 'paste',
        attrs: {
          button: {
            'data-tooltip': 'paste(crtl+v)',
            'data-tooltip-position': 'top',
            'data-tooltip-position-selector': '.toolbar-container'
          }
        }
      },
      { type: 'separator' },
      {
        type: 'label',
        name: 'reference-width-label',
        text: 'Ref W:'
      },
      {
        type: 'inputNumber',
        label: 'width',
        name: 'reference-width',
        min: 100,
        max: 20000,
        value: referenceSize.width
      },
      {
        type: 'separator'
      },
      {
        type: 'label',
        name: 'reference-height-label',
        text: 'Ref H:'
      },
      {
        type: 'inputNumber',
        name: 'reference-height',
        min: 100,
        max: 20000,
        value: referenceSize.height
      }
    ],
    autoToggle: true,
    references: {
      paperScroller,
      commandManager
    }
  }
}
