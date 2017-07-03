/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import cx from 'classnames'
import { Message } from '../types'
import PanelSectionHeader from './panel-section-header'
import PanelMessage from './panel-message'

class PanelSection {
  props: {
    file: string,
    messages: Message[],
    selected: string,
    expanded: boolean,
    onSelectFile: string => *,
    onSelectMessage: Message => *
  }

  constructor (props) {
    this.props = props
    this.didClickHeader = this.didClickHeader.bind(this)

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  didClickHeader () {
    this.props.onSelectFile(this.props.file)
  }

  render () {
    const messages = this.props.messages.map(message =>
      <PanelMessage
        selected={this.props.selected[1] === message.key}
        onSelect={this.props.onSelectMessage}
        message={message}
      />
    )

    let table = null
    if (this.props.expanded) {
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
          expanded={this.props.expanded}
          selected={this.props.selected.length === 1 && this.props.selected[0] === this.props.file}
          onClick={this.didClickHeader.bind(this)}
        />
        {table}
      </div>
    )
  }
}

export default PanelSection
