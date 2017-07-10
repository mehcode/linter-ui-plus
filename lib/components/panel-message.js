/* @flow */
/* @jsx etch.dom */

import type { LinterMessage } from '@atom/linter'
import type { Selected } from '../types'

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('etch')
const cx = lazyImport('classnames')
const { $range, $excerpt, $file } = lazyImport('../util')

type Props = {
  message: LinterMessage,
  selected: boolean,
  onSelect: Selected => *
}

class PanelMessage {
  props: Props

  constructor (props: Props) {
    this.props = props

    etch.initialize(this)
  }

  update (props: Props) {
    this.props = props

    return etch.update(this)
  }

  didClick () {
    this.props.onSelect({file: $file(this.props.message), message: this.props.message})
  }

  didDoubleClick () {
    this.props.onSelect({file: $file(this.props.message), message: this.props.message}, {activate: true})
  }

  render () {
    const { severity } = this.props.message
    const position = $range(this.props.message)
    const cn = cx('panel-message panel-row', `severity-${severity}`, {
      'panel-row-selected': this.props.selected
    })

    return (
      <tr
        className={cn}
        attributes={{ 'data-key': this.props.message.key }}
        on={{ click: this.didClick, dblclick: this.didDoubleClick }}
      >
        <td className="marker-focus" />
        <td className="position-row">
          {position.start.row + 1}
        </td>
        <td className="position-separator">
          {':'}
        </td>
        <td className="position-column">
          {position.start.column + 1}
        </td>
        <td className={`severity luip-icon luip-icon-${severity}`} />
        <td className="provider-cell">
          <span className="provider">
            {this.props.message.linterName}
          </span>
        </td>
        <td className="excerpt">
          {$excerpt(this.props.message)}
        </td>
      </tr>
    )
  }
}

export default PanelMessage
