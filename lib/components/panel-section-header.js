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
    const pathname = path.dirname(atom.project.relativize(this.props.file))
    const filename = path.basename(this.props.file)

    return (
      <tr
        on={{click: this.props.onClick}}
        attributes={{"data-file": this.props.file}}
        className={cx('panel-section-header panel-row', {
          'panel-section-expanded': this.props.expanded,
          'panel-row-selected': this.props.selected
        })}
      >
        <td className="marker-focus" />
        <td colSpan="6" className="panel-section-header-main">
          <i className="icon icon-file" />
          <span className="file">
            {filename}{" — "}{pathname}
          </span>
          <span className="badge">
            {this.props.count}
          </span>
        </td>
      </tr>
    )
  }
}

export default PanelSectionHeader
