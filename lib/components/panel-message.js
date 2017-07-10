/* @flow */
/* @jsx etch.dom */

import type { LinterMessage } from '@atom/linter'
import type { Selected } from '../types'

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('../etch')
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
    const { message, selected } = this.props
    const position = $range(message)
    const cn = cx('panel-message panel-row', `severity-${message.severity}`, {
      'panel-row-selected': selected
    })

    let descriptionIndicator = null
    if (message.version === 2 && message.description != null) {
      descriptionIndicator = (<i className='panel-message-descripton icon icon-ellipsis' />)
    }

    let link = null
    if (message.version === 2 && message.url != null) {
      link = (
        <a
          className='panel-message-link icon icon-link-external'
          href={message.url}
          target='_blank'
        />
      )
    }

    return (
      <tr
        className={cn}
        attributes={{ 'data-key': message.key }}
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
        <td className={`severity luip-icon luip-icon-${message.severity}`} />
        <td className="provider-cell">
          <span className="provider">
            {message.linterName}
          </span>
        </td>
        <td className='excerpt-cell'>
          <span className='exceprt'>{$excerpt(message)}</span>
          {descriptionIndicator}
          {link}
        </td>
      </tr>
    )
  }
}

export default PanelMessage
