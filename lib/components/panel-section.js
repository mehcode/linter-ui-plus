/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import { sortBy } from 'lodash'
import cx from 'classnames'
import { Message } from '../types'
import PanelSectionHeader from './panel-section-header'
import PanelMessage from './panel-message'

class PanelSection {
  props: {
    file: string,
    messages: Message[],
    selected: string,
    onSelectFile: string => *,
    onSelectMessage: Message => *
  }

  constructor (props) {
    this.props = props
    this._expanded = true
    this.didClickHeader = this.didClickHeader.bind(this)

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  didClickHeader () {
    // Update expansion state
    this._expanded = !this._expanded

    // And flag this as selected
    this.props.onSelectFile(this.props.file)

    etch.update(this)
  }

  render () {
    const messages = this.props.messages.map(message =>
      <PanelMessage
        selected={this.props.selected === message.key}
        onSelect={this.props.onSelectMessage}
        message={message}
      />
    )

    let table = null
    if (this._expanded) {
      table = (
        <table>
          {messages}
        </table>
      )
    }

    return (
      <div className={cx('panel-section')}>
        <PanelSectionHeader
          file={this.props.file}
          count={this.props.messages.length}
          expanded={this._expanded}
          selected={this.props.selected === this.props.file}
          onClick={this.didClickHeader.bind(this)}
        />
        {table}
      </div>
    )
  }
}

export default PanelSection
