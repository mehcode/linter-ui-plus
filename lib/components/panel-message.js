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
    this._dblTimeout = null

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  didClick () {
    // FIXME: Waiting on https://github.com/atom/etch/pull/57
    let isDouble = false
    if (this._dblTimeout != null) {
      console.log("didClick -< this._dblTimeout != null")
      isDouble = true
      clearTimeout(this._dblTimeout)
      this._dblTimeout = null
    }

    console.log("didClick", {isDouble})
    this.props.onSelect(this.props.message, isDouble)

    this._dblTimeout = setTimeout(() => {
      this._dblTimeout = null
    }, 500)
  }

  render () {
    const { severity, location, excerpt } = this.props.message
    const cn = cx('panel-message panel-row', `severity-${severity}`, {
      'panel-row-selected': this.props.selected
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
