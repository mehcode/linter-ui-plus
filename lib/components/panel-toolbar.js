/* @flow */
/* @jsx etch.dom */

import type { TextBuffer } from 'atom'
import type { Severity } from '@atom/linter'
import PanelToolbarSearch from './panel-toolbar-search'

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('../etch')
const cx = lazyImport('classnames')

type Props = {
  onExpandAll: () => *,
  onCollapseAll: () => *,
  onSelectSeverity: (?string) => *,
  onMoveNext: () => *,
  onMovePrevious: () => *,
  onSearch: () => *,

  searchBuffer: TextBuffer,

  // Count of sections expanded
  sectionsExpanded: number,

  // Whether we have _any_ warnings, errors, or infos
  warnings: number,
  errors: number,
  infos: number,

  // The _severity_ selected in the filter group; `null` means ALL
  selectedSeverity: ?Severity
}

class PanelToolbar {
  props: Props

  constructor (props: Props) {
    this.props = props

    etch.initialize(this)
  }

  update (props: Props) {
    this.props = props

    return etch.update(this)
  }

  didClickFoldOrUnfold () {
    if (this.props.sectionsExpanded === 0) {
      // If there are no sections expanded, expand all
      this.props.onExpandAll()
    } else {
      // Otherwise, collapse all
      this.props.onCollapseAll()
    }
  }

  render () {
    // The severity filter buttons only show if
    // we have at least 2 kinds of messages
    let severityFilter = null
    const filters: Array<[Severity, string]> = []
    if (this.props.errors > 0) filters.push(['error', 'Errors'])
    if (this.props.warnings > 0) filters.push(['warning', 'Warnings'])
    if (this.props.infos > 0) filters.push(['info', 'Infos'])
    if (filters.length > 1) {
      const buttons = [
        <button
          key="all"
          className={cx('btn', {
            selected: this.props.selectedSeverity == null
          })}
          on={{ click: this.props.onSelectSeverity.bind(null, null) }}
        >
          {'All'}
        </button>
      ].concat(
        filters.map(severity =>
          <button
            key={severity[0]}
            className={cx('btn', {
              selected: this.props.selectedSeverity === severity[0]
            })}
            on={{ click: this.props.onSelectSeverity.bind(null, severity[0]) }}
          >
            {severity[1]}
          </button>
        )
      )

      severityFilter = (
        <div className="btn-group">
          {buttons}
        </div>
      )
    }

    let foldIconName = 'fold'
    if (this.props.sectionsExpanded === 0) {
      foldIconName = 'unfold'
    }

    // Disable toolbar buttons when there is nothing
    const disabled = this.props.errors === 0 && this.props.warnings === 0 && this.props.infos === 0

    return (
      <div className="panel-toolbar btn-toolbar">
        <button
          disabled={disabled}
          className={`btn icon icon-${foldIconName}`}
          on={{ click: this.didClickFoldOrUnfold }}
        />
        {severityFilter}
        <button disabled={disabled} className="btn icon icon-arrow-up" on={{click: this.props.onMovePrevious}} />
        <button disabled={disabled} className="btn icon icon-arrow-down" on={{click: this.props.onMoveNext}} />
        <div className="spacer" />
        <PanelToolbarSearch
          buffer={this.props.searchBuffer}
          onSearch={this.props.onSearch}
        />
      </div>
    )
  }
}

export default PanelToolbar
