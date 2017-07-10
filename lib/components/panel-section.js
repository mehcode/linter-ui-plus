/* @flow */
/* @jsx etch.dom */

import type { LinterMessage } from '@atom/linter'
import type { Selected } from '../types'

import PanelSectionHeader from './panel-section-header'
import PanelMessage from './panel-message'
import PanelMessageDescription from './panel-message-description'

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('../etch')
const cx = lazyImport('classnames')

type Props = {
  file: string,
  messages: LinterMessage[],
  selected: ?Selected,
  expanded: boolean,
  onSelect: Selected => *
}

class PanelSection {
  props: Props

  constructor (props: Props) {
    this.props = props

    etch.initialize(this)
  }

  update (props: Props) {
    this.props = props

    return etch.update(this)
  }

  didClickHeader () {
    this.props.onSelect({ file: this.props.file })

    etch.update(this)
  }

  render () {
    const rows = []
    for (const message of this.props.messages) {
      const selected = this.props.selected == null
        ? null
        : this.props.selected.message === message

      rows.push(
        <PanelMessage
          selected={selected}
          onSelect={this.props.onSelect}
          message={message}
        />
      )

      if (selected && message.version === 2 && message.description != null) {
        rows.push(
          <PanelMessageDescription
            description={message.description}
          />
        )
      }
    }

    return (
      <tbody className={cx('panel-section')}>
        <PanelSectionHeader
          file={this.props.file}
          count={this.props.messages.length}
          expanded={this.props.expanded}
          selected={
            this.props.selected != null &&
            this.props.selected.file === this.props.file &&
            this.props.selected.message == null
          }
          onClick={this.didClickHeader.bind(this)}
        />
        {this.props.expanded ? rows : null}
      </tbody>
    )
  }
}

export default PanelSection
