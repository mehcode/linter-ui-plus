/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import cx from 'classnames'
import { TextEditor } from 'atom'

class PanelToolbar {
  props: {
    // Whether we have _any_ warnings, errors, or infos
    hasWarnings: boolean,
    hasErrors: boolean,
    hasInfos: boolean,
    // The _severity_ selected in the filter group; `null` means ALL
    severitySelected: ?string,
  }

  constructor (props) {
    this.props = props

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  didClickToggleFold () {
    this.props.onFold(this.props.foldState !== 'all-collapsed')
  }

  render () {
    // The severity filter buttons only show if
    // we have at least 2 kinds of messages
    let severityFilter = null
    const filters = []
    if (this.props.hasErrors) filters.push(['error', 'Errors'])
    if (this.props.hasWarnings) filters.push(['warning', 'Warnings'])
    if (this.props.hasInfos) filters.push(['info', 'Infos'])
    if (filters.length > 1) {
      const buttons = [
        <button
          key="all"
          className={cx('btn', { selected: this.props.severitySelected == null })}
          on={{ click: this.props.onSelectSeverity.bind(null, null) }}
        >
          {'All'}
        </button>
      ].concat(
        filters.map(severity =>
          <button
            key={severity[0]}
            className={cx('btn', {
              selected: this.props.severitySelected === severity[0]
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

    let foldIconName = "fold"
    if (this.props.foldState === 'all-collapsed') {
      foldIconName = "unfold"
    }

    return (
      <div className='panel-toolbar btn-toolbar'>
        <button
          className={`btn icon icon-${foldIconName}`}
          on={{ click: this.didClickToggleFold }}
        />
        {severityFilter}
        <button className="btn icon icon-arrow-up" />
        <button className="btn icon icon-arrow-down" />
        <div className="spacer" />
        {
          etch.dom(TextEditor, {
            ref: 'findEditor',
            mini: true,
            placeholderText: 'Search all messages'
          })
        }
      </div>
    )
  }
}

export default PanelToolbar
