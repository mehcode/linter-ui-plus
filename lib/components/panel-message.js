/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import cx from 'classnames'
import { Message } from '../types'

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

  async didClick () {
    // Flag as selected
    this.props.onSelect(this.props.message)
  }

  render () {
    const { severity, location, excerpt } = this.props.message
    const cn = cx('panel-message panel-row', `severity-${severity}`, {
      'panel-row-selected': this.props.selected,
    })

    return (
      <tr className={cn} on={{click: this.didClick}}>
        <td className="marker"></td>
        <td className="position-row">
          {location.position.start.row + 1}
        </td>
        <td className="position-separator">{':'}</td>
        <td className="position-column">
          {location.position.start.column + 1}
        </td>
        <td className="excerpt">
          {excerpt}
        </td>
      </tr>
    )
  }
}

export default PanelMessage
