/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import EtchComponent from '../etch-component'
import cx from 'classnames'
import path from 'path'

class PanelSectionHeader extends EtchComponent {
  props: {
    file: string,
    path?: string,
    expanded: boolean,
    count: number
  }

  render () {
    let desc = path.basename(this.props.file)

    if (this.props.path != null) {
      desc += ' — ' + this.props.path
    }

    return (
      <div
        className={cx('panel-section-header', {
          'panel-section-expanded': this.props.expanded
        })}
      >
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
