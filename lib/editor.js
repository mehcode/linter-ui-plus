/* @flow */
/* @jsx etch.dom */

import type { DisplayMarker, TextEditor } from 'atom'
import type { LinterMessage } from '@atom/linter'

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('./etch')
const { $range } = lazyImport('./util')

// TODO: Add config option to remove gutter decorations
// TODO: Add config option to control position of gutter decorations (?)

class Editor {
  markers: Map<LinterMessage, DisplayMarker>
  textEditor: TextEditor

  constructor (textEditor: TextEditor, initialMessages: LinterMessage[]) {
    this.textEditor = textEditor
    this.markers = new Map()

    // Add a gutter to hold a warning/error/info decoration for
    // any linter messages on the line
    this.textEditor.addGutter({
      name: 'linter-ui-plus',
      priority: 100
    })

    // TODO: Talk with someone from atom about marker layers in combination with gutter decorations
    //       It makes sense that they can't work for `item` but they _should_ be able to work for extending the
    //       line selection highlight to custom gutters
    //
    // BUG: The below should be sufficient for extending line selection highlight to this custom gutter. The problem is missing `onlyHead` support for gutter decorations.
    // this.textEditor.decorateMarkerLayer(this.textEditor.selectionsMarkerLayer, {gutterName: "linter-ui-plus", type: 'gutter', class: 'cursor-line'})
    // this.textEditor.decorateMarkerLayer(this.textEditor.selectionsMarkerLayer, {gutterName: "linter-ui-plus", type: 'gutter', class: 'cursor-line-no-selection', onlyEmpty: true, onlyHead: true})

    // Add each initial message
    for (const initialMessage of initialMessages) {
      this.addMessage(initialMessage)
    }
  }

  destroy () {}

  addMessage (message: LinterMessage) {
    const marker = this.textEditor.markBufferRange($range(message), {
      invalidate: 'never'
    })

    marker.onDidChange(
      ({ isValid, oldHeadBufferPosition, newHeadBufferPosition }) => {
        if (
          !isValid ||
          (newHeadBufferPosition.row === 0 && oldHeadBufferPosition.row !== 0)
        ) {
          // This marker is invalid; ignore it
          return
        }

        // This marker is valid; the message just moved
        // New lines entered above, etc.
        if (message.version === 1) {
          message.range = marker.bufferMarker.previousEventState.range
        } else {
          message.location.position = marker.bufferMarker.previousEventState.range
        }
      }
    )

    // Remember the marker so we can destroy it later when somebody fixes
    // the lint message
    this.markers.set(message, marker)

    // TODO: Make sure we _only_ decorate the greatest intensity message
    //       We probably need to collect messages by line number and
    //       mark/decorate that way

    this.textEditor.decorateMarker(marker, {
      type: 'gutter',
      gutterName: 'linter-ui-plus',
      class: 'linter-gutter-marker',
      item: etch.render(
        <span className={`luip-icon luip-icon-${message.severity}`} />
      )
    })

    this.textEditor.decorateMarker(marker, {
      type: 'highlight',
      class: `linter-highlight-${message.severity}`
    })
  }

  removeMessage (message: LinterMessage) {
    // Remove the marker corresponding to this message from the editor
    const marker = this.markers.get(message)
    if (marker != null) {
      marker.destroy()
      this.markers.delete(message)
    }
  }
}

module.exports = Editor
