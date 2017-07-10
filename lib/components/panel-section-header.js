/* @flow */
/* @jsx etch.dom */

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('../etch')
const cx = lazyImport('classnames')
const path = lazyImport('path')

type Props = {
  file: string,
  path?: string,
  count: number,
  expanded: boolean,
  selected: boolean,
  onClick: () => *,
}

class PanelSectionHeader {
  props: Props

  constructor (props: Props) {
    this.props = props

    etch.initialize(this)
  }

  update (props: Props) {
    this.props = props

    return etch.update(this)
  }

  render () {
    const dirname = path.dirname(atom.project.relativize(this.props.file))
    const filename = path.basename(this.props.file)

    return (
      <tr
        on={{click: this.props.onClick}}
        attributes={{'data-file': this.props.file}}
        className={cx('panel-section-header panel-row', {
          'panel-section-expanded': this.props.expanded,
          'panel-row-selected': this.props.selected
        })}
      >
        <td className="marker-focus" />
        <td colSpan="6" className="panel-section-header-main">
          <i className="icon icon-file" />
          <span className="file">
            {`${filename} — ${dirname}`}
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
