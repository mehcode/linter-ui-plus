/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import cx from 'classnames'
import type { Message } from '../types'

class PanelMessage {
  props: {
    message: Message,
    selected: boolean,
    onSelect: (Message) => *
  }

  constructor (props) {
    this.props = props

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  didClick () {
    this.props.onSelect(this.props.message, false)
  }

  didDoubleClick () {
    this.props.onSelect(this.props.message, true)
  }

  render () {
    const { severity, location, excerpt, linterName } = this.props.message
    const cn = cx('panel-message panel-row', `severity-${severity}`, {
      'panel-row-selected': this.props.selected
    })

    return (
      <tr className={cn} on={{click: this.didClick, dblclick: this.didDoubleClick}}>
        <td className="position-row">
          {location.position.start.row + 1}
        </td>
        <td className="position-separator">{':'}</td>
        <td className="position-column">
          {location.position.start.column + 1}
        </td>
        <td className="excerpt">
          <span className="provider">{linterName}</span>
          {excerpt}
        </td>
      </tr>
    )
  }
}

export default PanelMessage
