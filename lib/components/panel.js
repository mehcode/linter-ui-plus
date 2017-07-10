/* @flow */
/* @jsx etch.dom */

import type { LinterMessage, Severity } from '@atom/linter'
import type { Selected, SelectOptions } from '../types'
import { WORKSPACE_URI } from '../constants'
import PanelSection from './panel-section'
import PanelToolbar from './panel-toolbar'

const lazyImport = require('import-lazy')(require)
const { CompositeDisposable, TextBuffer, Emitter } = lazyImport('atom')
const etch = lazyImport('../etch')
const cx = lazyImport('classnames')
const { $excerpt } = lazyImport('../util')

export type Props = {
  selected: ?Selected,
  onSelect: (?Selected, ?SelectOptions) => *,

  // Files
  files: string[],

  // File URI -> Linter Message
  messagesByFile: Map<string, LinterMessage[]>,

  // Counts
  messageCountsBySeverity: { warning: number, error: number, info: number }
}

class Panel {
  props: Props
  element: any
  _emitter = new Emitter()
  subscriptions = new CompositeDisposable()
  _selectedSeverity: ?Severity
  _collapsed: { [string]: boolean }
  _hasFocus = false
  _selectedSeverity = null
  _collapsed = {}
  _filteredMessagesByFile: Map<string, LinterMessage[]> = new Map()
  _filteredFiles: string[] = []
  _searchBuffer = new TextBuffer()

  constructor (props: Props) {
    this.props = props

    etch.initialize(this)

    // Update filtered buckets
    this.updateFilteredMessages()

    // Register commands in the panel scope
    this.subscriptions.add(
      atom.commands.add(this.element, {
        'linter-ui-plus:open-selected-entry': this.didOpenSelected,
        'core:move-up': this.didMovePrevious,
        'core:move-down': this.didMoveNext
      })
    )
  }

  onDidDestroy (callback: () => *) {
    return this._emitter.on('did-destroy', callback)
  }

  destroy () {
    this._emitter.emit('did-destroy')
    this.subscriptions.dispose()
    etch.destroy(this)
  }

  update (props: Props) {
    this.props = props

    etch.update(this)
  }

  readAfterUpdate () {
    // Ensure we keep the currently selected _thing_ in view
    const selectedEl = this.element.querySelector(`.panel-row-selected`)
    if (selectedEl != null) {
      selectedEl.scrollIntoViewIfNeeded(true)
    }

    // Ensure the description is in view if present
    const descEl = this.element.querySelector(`.panel-row-selected + .panel-message-description`)
    if (descEl != null) {
      descEl.scrollIntoViewIfNeeded(true)
    }
  }

  applyMessageFilter (messages: LinterMessage[]): LinterMessage[] {
    // TODO: Use fuzzaldrin-plus for a fuzzy filter
    // TODO: Support file:<term>, provider:<term> ?

    return messages.filter(
      message => {
        let match = true

        // Apply search
        if (!this._searchBuffer.isEmpty()) {
          const searchText = this._searchBuffer.getText()

          match = match && (
            // Is the text in the excerpt?
            $excerpt(message).indexOf(searchText) >= 0 ||

            // Is the text in the provider name?
            message.linterName.indexOf(searchText) >= 0
          )
        }

        // Apply severity filter
        if (this._selectedSeverity != null) {
          match = match && message.severity === this._selectedSeverity
        }

        return match
      }
    )
  }

  didMovePrevious = () => {
    // There are no messages; do nothing
    if (this._filteredFiles.length === 0) return

    let messages
    let selectedFile = ''
    let selectedMessage

    if (this.props.selected != null) {
      selectedFile = this.props.selected.file
      messages = this._filteredMessagesByFile.get(selectedFile)
    }

    // Nothing is selected, select the last message of the last file
    if (messages == null || messages.length === 0) {
      selectedFile = this._filteredFiles[this._filteredFiles.length - 1]
      messages = this._filteredMessagesByFile.get(selectedFile)

      if (messages != null) {
        this.props.onSelect({
          file: selectedFile,
          message: messages[messages.length - 1]
        })
      }

      return
    } else if (
      this.props.selected != null &&
      this.props.selected.message != null &&
      messages.indexOf(this.props.selected.message) >= 0
    ) {
      selectedMessage = this.props.selected.message
    }

    if (selectedMessage != null) {
      // Get the index of the message
      const messageIndex = messages.indexOf(selectedMessage)

      if (messageIndex > 0) {
        // Move it backwards
        this.props.onSelect({
          file: selectedFile,
          message: messages[messageIndex - 1]
        })
      } else {
        // Select the file alone
        this.props.onSelect({ file: selectedFile })
      }

      return
    }

    // No message is selected, select the last message in the _previous_ file
    const fileIndex = this._filteredFiles.indexOf(selectedFile)

    if (fileIndex > 0) {
      // Select the previous file
      selectedFile = this._filteredFiles[fileIndex - 1]
    } else {
      // Select the last file
      selectedFile = this._filteredFiles[this._filteredFiles.length - 1]
    }

    // If this previous file is collapsed, just select the file
    if (this._collapsed[selectedFile]) {
      this.props.onSelect({file: selectedFile})

      return
    }

    // Select the last message in that file
    messages = this._filteredMessagesByFile.get(selectedFile)
    if (messages != null) {
      this.props.onSelect({
        file: selectedFile,
        message: messages[messages.length - 1]
      })
    }
  }

  didMoveNext = () => {
    // There are no messages; do nothing
    if (this._filteredFiles.length === 0) return

    let messages
    let selectedFile = ''
    let selectedMessage

    if (this.props.selected != null) {
      selectedFile = this.props.selected.file
      messages = this._filteredMessagesByFile.get(selectedFile)
    }

    // Nothing is selected, select the last message in the last file
    if (messages == null || messages.length === 0) {
      this.props.onSelect({ file: this._filteredFiles[0] })

      return
    } else if (
      this.props.selected != null &&
      this.props.selected.message != null &&
      messages.indexOf(this.props.selected.message) >= 0
    ) {
      selectedMessage = this.props.selected.message
    }

    if (!this._collapsed[selectedFile]) {
      if (selectedMessage == null) {
        // No message is selected, select the first message in the file
        this.props.onSelect({
          file: selectedFile,
          message: messages[0]
        })

        return
      }

      // Get the index of the message
      const messageIndex = messages.indexOf(selectedMessage)

      // Move it forward
      if (messageIndex < messages.length - 1) {
        this.props.onSelect({
          file: selectedFile,
          message: messages[messageIndex + 1]
        })

        return
      }
    }

    // Reached the end of the file, go to the next file
    const fileIndex = this._filteredFiles.indexOf(selectedFile)
    if (fileIndex < this._filteredFiles.length - 1) {
      this.props.onSelect({ file: this._filteredFiles[fileIndex + 1] })

      return
    }

    // Reached the end of the file list, go to the first file
    this.props.onSelect({ file: this._filteredFiles[0] })
  }

  didCollapseAll = () => {
    this.props.files.forEach(file => {
      this._collapsed[file] = true
    })

    etch.update(this)
  }

  didExpandAll = () => {
    this.props.files.forEach(file => {
      this._collapsed[file] = false
    })

    etch.update(this)
  }

  didSelectSeverity = (severity: ?Severity) => {
    this._selectedSeverity = severity

    this.updateFilteredMessages()
  }

  didOpenSelected = () => {
    if (this.props.selected != null) {
      if (this.props.selected.message == null) {
        // A file is selected; toggle the collapse state
        const collapsed = this._collapsed[this.props.selected.file]
        this._collapsed[this.props.selected.file] = !collapsed

        etch.update(this)
      } else {
        // A message is selected; activate the pane
        this.props.onSelect(this.props.selected, { activate: true })
      }
    }
  }

  didFocus () {
    this._hasFocus = true

    etch.update(this)
  }

  didBlur () {
    this._hasFocus = false

    etch.update(this)
  }

  updateFilteredMessages () {
    this._filteredMessagesByFile.clear()
    this._filteredFiles.splice(0)

    for (const file of this.props.files) {
      let messages = this.props.messagesByFile.get(file)
      if (messages == null || messages.length === 0) continue

      messages = this.applyMessageFilter(messages)
      if (messages.length === 0) continue

      this._filteredFiles.push(file)
      this._filteredMessagesByFile.set(file, messages)
    }

    return etch.update(this)
  }

  updateMessages (
    files: string[],
    messagesByFile: Map<string, LinterMessage[]>,
    messageCountsBySeverity: { warning: number, error: number, info: number }
  ) {
    this.props.files = files
    this.props.messagesByFile = messagesByFile
    this.props.messageCountsBySeverity = messageCountsBySeverity

    return this.updateFilteredMessages()
  }

  updateSelected (selected: ?Selected, options: ?SelectOptions) {
    this.props.selected = selected

    if (selected != null) {
      if (selected.message == null) {
        // IF we selected a file, set the expansion state
        if (options && options.collapsed != null) {
          this._collapsed[selected.file] = options.collapsed
        }
      } else {
        // IF we selected a message, make sure its expanded
        this._collapsed[selected.file] = false
      }
    }

    return etch.update(this)
  }

  didSelect = (selected: ?Selected, options: ?SelectOptions) => {
    // A selection was triggered from a click inside the panel
    // on a file or message

    // IF we selected a file, toggle the expansion state
    if (selected != null) {
      if (selected.message == null) {
        this._collapsed[selected.file] = !this._collapsed[selected.file]
      }
    }

    return this.props.onSelect(selected, options)
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

  didSearch = () => {
    this.updateFilteredMessages()
  }

  render () {
    const sections = []
    let expandedTotal = 0

    this._filteredFiles.forEach(file => {
      const messages = this._filteredMessagesByFile.get(file)
      if (messages != null && messages.length > 0) {
        const expanded = !this._collapsed[file]

        if (expanded) {
          expandedTotal += 1
        }

        sections.push(
          <PanelSection
            file={file}
            messages={messages}
            expanded={expanded}
            selected={this.props.selected}
            onSelect={this.didSelect}
          />
        )
      }
    })

    return (
      <div
        className={cx('linter-ui-plus panel', {
          'panel-focus': this._hasFocus
        })}
        tabIndex="0"
        on={{ focus: this.didFocus, blur: this.didBlur }}
      >
        <PanelToolbar
          sectionsExpanded={expandedTotal}
          errors={this.props.messageCountsBySeverity.error}
          warnings={this.props.messageCountsBySeverity.warning}
          infos={this.props.messageCountsBySeverity.info}
          selectedSeverity={this._selectedSeverity}
          onMoveNext={this.didMoveNext}
          onSelectSeverity={this.didSelectSeverity}
          onMovePrevious={this.didMovePrevious}
          onCollapseAll={this.didCollapseAll}
          onExpandAll={this.didExpandAll}
          onSearch={this.didSearch}
          searchBuffer={this._searchBuffer}
        />
        <div className="table-container">
          <table>
            {sections}
          </table>
        </div>
      </div>
    )
  }
}

module.exports = Panel
