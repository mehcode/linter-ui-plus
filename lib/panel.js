/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import cx from 'classnames'
import { MessagesPatch, Message } from './types'
import { WORKSPACE_URI } from './constants'
import PanelSectionHeader from './components/panel-section-header'
import PanelMessage from './components/panel-message'
import PanelSection from './components/panel-section'
import PanelToolbar from './components/panel-toolbar'

class Panel {
  constructor (props) {
    this.props = props
    this.didSelectFile = this.didSelectFile.bind(this)
    this.didSelectMessage = this.didSelectMessage.bind(this)
    this._messagesByFile = {}
    this._errors = 0
    this._warns = 0
    this._infos = 0
    this._selected = []
    this._severitySelected = null
    this._collapsed = {}
    this._hasFocus = false

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  updateMessageTotals (errors: number, warnings: number, infos: number) {
    this._errors = errors
    this._warns = warnings
    this._infos = infos

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
    return ['center', 'bottom', 'top', 'right', 'left']
  }

  getPreferredHeight () {
    // FIXME: This should be 20-30% of the viewport height
    return 350
  }

  openSelected () {
    if (this._selected != null) {
      if (this._selected.length === 1) {
        // A file is selected; toggle the collapse state
        this._selectFile(this._selected[0])
        etch.update(this)
      } else {
        // A message is selected; activate the pane
        const message = find(this._messagesByFile[this._selected[0]], {
          key: this._selected[1]
        })

        this._selectMessage(message, true)
      }
    }
  }

  moveNext () {
    if (this._selected && this._messagesByFile[this._selected[0]] != null) {
      const messages = this._messagesByFile[this._selected[0]]
      let message;

      if (this._selected.length === 1) {
        // Select the _first_ message in this file
        message = messages[0]
      } else {
        // Get our current message
        const selectedIndex = this._selected[2];

        if (selectedIndex < (messages.length - 1)) {
          // Select the next message in this file
          message = messages[selectedIndex + 1]
        } else {
          // Select the first message in the file
          message = messages[0]
        }
      }

      // Move the selection
      this.didSelectMessage(message, false)

      // Make sure this file is expanded
      this._collapsed[this._selected[0]] = false

      // Make sure this el is in focus
      const el = this.element.querySelector(
        `.panel-message[data-key="${message.key}"]`
      )
      if (el != null) {
        el.scrollIntoViewIfNeeded(false)
      }
    }
  }

  didSelectMessage (message: Message, focus: boolean) {
    const { key, location } = message

    // Find this message in the message array
    const index = findIndex(this._messagesByFile[location.file], {key})

    // Mark this message as selected
    this._selected = [location.file, key, index]
    etch.update(this)

    // Activate the pane
    // and select the offense
    this._selectMessage(message, focus)
  }

  readAfterUpdate () {
    // Ensure we keep the currently selected _thing_ in view
    const el = this.element.querySelector(`.panel-row-selected`)
    if (el != null) {
      el.scrollIntoViewIfNeeded(true)
    }
  }

  async _selectMessage (message: Message, focus: boolean) {
    const { location } = message

    const editor = await atom.workspace.open(location.file, {
      initialLine: location.position.start.row,
      initialColumn: location.position.start.column,
      pending: true,
      activatePane: focus,
      activateItem: true
    })

    editor.setSelectedBufferRange(location.position, {
      preserveFolds: false,
      reversed: true
    })
  }

  async didSelectFile (file: string, collapsed?: boolean) {
    this._selected = [file]
    if (collapsed == null) this._selectFile(file)
    else this._collapsed[file] = collapsed

    await etch.update(this)

    const el = this.element.querySelector(
      `.panel-section-header[data-file="${file}"]`
    )
    if (el != null) {
      el.scrollIntoViewIfNeeded(true)
    }
  }

  _selectFile (file: string) {
    this._collapsed[file] = !this._collapsed[file]
  }

  didBlur () {
    this._hasFocus = false

    etch.update(this)
  }

  didFocus () {
    this._hasFocus = true

    etch.update(this)
  }

  didFold (collapse: boolean) {
    for (const file of Object.keys(this._messagesByFile)) {
      this._collapsed[file] = collapse
    }

    etch.update(this)
  }

  didSelectSeverity (severity: ?string) {
    this._severitySelected = severity

    etch.update(this)
  }

  render () {
    let sections = [];
    let totalExpanded = 0;
    for (const file of Object.keys(this._messagesByFile)) {
      let messages = this._messagesByFile[file]
      if (this._severitySelected != null) {
        messages = messages.filter(
          message => message.severity === this._severitySelected
        )
      }

      let expanded = !this._collapsed[file]
      if (expanded) totalExpanded += 1;

      if (messages.length > 0) {
        sections.push(
          <PanelSection
            file={file}
            messages={messages}
            expanded={expanded}
            selected={this._selected}
            onSelectFile={this.didSelectFile}
            onSelectMessage={this.didSelectMessage}
          />
        )
      }
    }

    let foldState;
    if (sections.length > 0 && sections.length === totalExpanded) {
      foldState = 'all-expanded'
    } else if (totalExpanded === 0) {
      foldState = 'all-collapsed'
    } else {
      foldState = 'partial'
    }

    return (
      <div
        class={cx('linter-ui-plus panel', { 'panel-focus': this._hasFocus })}
        on={{ focus: this.didFocus, blur: this.didBlur }}
        tabIndex="0"
      >
        <PanelToolbar
          hasErrors={this._errors > 0}
          hasWarnings={this._warns > 0}
          hasInfos={this._infos > 0}
          foldState={foldState}
          severitySelected={this._severitySelected}
          onFold={this.didFold.bind(this)}
          onSelectSeverity={this.didSelectSeverity.bind(this)}
        />
        <div className="main">
          <table>
            {sections}
          </table>
        </div>
      </div>
    )
  }
}

export default Panel
