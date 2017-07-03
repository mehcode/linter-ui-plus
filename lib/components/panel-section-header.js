/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import cx from 'classnames'
import path from 'path'

class PanelSectionHeader {
  props: {
    file: string,
    path?: string,
    count: number,
    expanded: boolean,
    selected: boolean,
    onClick: () => *,
  }

  constructor (props) {
    this.props = props

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  render () {
    let desc = path.basename(this.props.file)

    if (this.props.path != null) {
      desc += ' — ' + this.props.path
    }

    return (
      <div
        on={{click: this.props.onClick}}
        className={cx('panel-section-header panel-row', {
          'panel-section-expanded': this.props.expanded,
          'panel-row-selected': this.props.selected
        })}
      >
        <span className="marker" />
        <i className="icon icon-file" />
        <span>
          {desc}
        </span>
        <span class="badge">
          {this.props.count}
        </span>
      </div>
    )
  }
}

export default PanelSectionHeader
