import * as joint from '@clientio/rappid'

export const getToolbarConfig = (paper: joint.dia.Paper, commandManager: joint.dia.CommandManager) => {
  return {
    tools: [
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
      { type: 'separator' }

    ],
    autoToggle: true,
    references: {
      // paperScroller: this.paperScroller,
      commandManager
    }
  }
}
