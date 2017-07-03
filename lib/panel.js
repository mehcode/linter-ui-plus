/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import cx from 'classnames'
import { MessagesPatch, Message } from './types'
import { WORKSPACE_URI } from './constants'
import PanelSectionHeader from './components/panel-section-header'
import PanelMessage from './components/panel-message'
import PanelSection from './components/panel-section'

class Panel {
  constructor (props) {
    this.props = props
    this.didSelectFile = this.didSelectFile.bind(this)
    this.didSelectMessage = this.didSelectMessage.bind(this)
    this._messagesByFile = {}
    this._selected = null
    this._hasFocus = false

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  updateMessages (difference: MessagesPatch) {
    // TODO: Is it worth it to use added/removed and
    //       do a patch update? Should probably profile this later.

    this._messagesByFile = groupBy(
      sortBy(difference.messages, [
        'location.position.start.row',
        'location.position.start.column'
      ]),
      'location.file'
    )

    return etch.update(this)
  }

  getURI () {
    return WORKSPACE_URI
  }

  getTitle () {
    return 'Linter'
  }

  getDefaultLocation () {
    return 'bottom'
  }

  getAllowedLocations () {
    return ['center', 'bottom', 'top']
  }

  getPreferredHeight () {
    return 200
  }

  async didSelectMessage (message: Message) {
    const { key, location } = message

    // Mark this message as selected
    this._selected = key
    etch.update(this)

    // Activate the pane (not the item, keep focus)
    // and select the offense
    const editor = await atom.workspace.open(location.file, {
      initialLine: location.position.start.row,
      initialColumn: location.position.start.column,
      pending: true,
      activatePane: false,
      activateItem: true
    })

    editor.setSelectedBufferRange(location.position, {
      preserveFolds: false
    })
  }

  didSelectFile (file: string) {
    this._selected = file

    return etch.update(this)
  }

  didBlur () {
    this._hasFocus = false

    etch.update(this)
  }

  didFocus () {
    this._hasFocus = true

    etch.update(this)
  }

  render () {
    const sections = map(this._messagesByFile, (messages, file) =>
      <PanelSection
        file={file}
        messages={messages}
        selected={this._selected}
        onSelectFile={this.didSelectFile}
        onSelectMessage={this.didSelectMessage}
      />
    )

    return (
      <div
        class={cx('linter-ui-plus panel', { 'panel-focus': this._hasFocus })}
        on={{ focus: this.didFocus, blur: this.didBlur }}
        tabIndex="0"
      >
        {sections}
      </div>
    )
  }
}

export default Panel
