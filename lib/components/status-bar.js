/* @flow */
/* @jsx etch.dom */

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('../etch')

type Props = {
  onClick: () => *,
  messageCountsBySeverity: { warning: number, error: number, info: number }
}

class StatusBar {
  props: Props
  element: any
  _tile: any
  _registry: any

  constructor (statusBarRegistry: any, props: Props) {
    this.props = props
    this._registry = statusBarRegistry

    etch.initialize(this)

    atom.config.observe('linter-ui-plus.showInStatusBar', this.attach)
    atom.config.observe('linter-ui-plus.statusBarPosition', this.attach)
  }

  update () {}

  updateMessageCounts (messageCountsBySeverity: {
    warning: number,
    error: number,
    info: number
  }) {
    this.props.messageCountsBySeverity = messageCountsBySeverity

    etch.update(this)
  }

  destroy () {
    this._tile.destroy()
    etch.destroy(this)
  }

  render () {
    return (
      <div
        className='inline-block linter-ui-plus status-bar'
        on={{ click: this.props.onClick }}
      >
        {['error', 'warning', 'info'].map(severity =>
          <span
            class={`tile tile-${severity}`}
            attributes={{
              'data-count': this.props.messageCountsBySeverity[severity]
            }}
          >
            {this.props.messageCountsBySeverity[severity]}
          </span>
        )}
      </div>
    )
  }

  attach = () => {
    if (this._tile != null) this._tile.destroy()
    if (!atom.config.get('linter-ui-plus.showInStatusBar')) return

    // TODO: Config option for position
    const position = atom.config.get('linter-ui-plus.statusBarPosition')
    this._tile = this._registry[`add${position}Tile`]({
      item: this.element,
      priority: position === 'Left' ? 0 : -100
    })
  }
}

module.exports = StatusBar
