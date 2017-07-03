/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import cx from 'classnames'
import { Message } from '../types'

class PanelMessage {
  props: Message

  constructor (props) {
    this.props = props

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  async didClick () {
    const { location } = this.props

    const editor = await atom.workspace.open(location.file, {
      initialLine: location.position.start.row,
      initialColumn: location.position.start.column,
      pending: true
    })

    // editor.setCursorBufferPosition(location.position.start)
    editor.setSelectedBufferRange(location.position, {
      preserveFolds: false
    })
  }

  render () {
    const { severity, location } = this.props
    const cn = cx('panel-message', `severity-${severity}`)
    return (
      <tr className={cn} on={{click: this.didClick}}>
        <td className="position-row">
          {location.position.start.row}
        </td>
        <td className="position-separator">{':'}</td>
        <td className="position-column">
          {location.position.start.column}
        </td>
        <td className="excerpt">
          {this.props.excerpt}
        </td>
      </tr>
    )
  }
}

export default PanelMessage
