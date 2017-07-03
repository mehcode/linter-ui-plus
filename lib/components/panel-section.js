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
    messages: Message[]
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
    this._expanded = !this._expanded

    etch.update(this)
  }

  render () {
    const messages = sortBy(this.props.messages, [
      'location.position.row',
      'location.position.column'
    ]).map(message => <PanelMessage {...message} />)

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
          onClick={this.didClickHeader.bind(this)}
        />
        {table}
      </div>
    )
  }
}

export default PanelSection
