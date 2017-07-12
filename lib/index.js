/* @flow */

import type { Linter, MessagesPatch, LinterMessage } from '@atom/linter'
import type { Selected, SelectOptions } from './types'

const lazyImport = require('import-lazy')(require)
const { CompositeDisposable } = lazyImport('atom')
const { $file, $range } = lazyImport('./util')
const { WORKSPACE_URI } = lazyImport('./constants')
let Editor
let Panel
let StatusBar

// TODO: Conver this into a class

let subscriptions
let idleCallbacks
let editors
let editorsByPath
let panel
let statusBar
let files: string[]
let messagesByFile: Map<string, LinterMessage[]>
let messageCountsBySeverity: { warning: number, error: number, info: number }
let selected: ?Selected

function activate () {
  subscriptions = new CompositeDisposable()
  idleCallbacks = new Set()
  files = []
  editors = {}
  editorsByPath = {}
  messagesByFile = new Map()
  messageCountsBySeverity = { warning: 0, error: 0, info: 0 }

  // Register commands attached to the workspace
  atom.commands.add('atom-workspace', {
    'linter-ui-plus:toggle-panel': togglePanel(true),
    'linter-ui-plus:move-to-next': moveToNext,
    'linter-ui-plus:move-to-previous': moveToPrevious
  })

  // Register opener for the panel
  subscriptions.add(
    atom.workspace.addOpener(uri => {
      if (uri === WORKSPACE_URI) {
        return getPanelInstance()
      }
    })
  )

  let observeTextEditorIdleCallbackId = window.requestIdleCallback(() => {
    idleCallbacks.delete(observeTextEditorIdleCallbackId)

    // Instantiate the linter panel so its ready to be shown quckly
    getPanelInstance()

    // Register observer for opened text editors. We need to watch
    // text editors in order to add buffer and marker decorations.
    atom.workspace.observeTextEditors(textEditor => {
      if (Editor == null) {
        Editor = require('./editor')
      }

      const editor = new Editor(textEditor, messagesByFile.get(textEditor.getPath()) || [])
      editors[textEditor.id] = editor

      const pathname = textEditor.getPath()
      if (editorsByPath[pathname] == null) {
        editorsByPath[pathname] = []
      }

      editorsByPath[pathname].push(textEditor.id)

      // TODO: Listen to more text editor events like linter-ui-default does

      subscriptions.add(
        textEditor.onDidDestroy(() => {
          delete editors[textEditor.id]

          const editorsAtPath = editorsByPath[textEditor.getPath()]
          const index = editorsAtPath.indexOf(textEditor.id)
          if (index >= 0) {
            editorsAtPath.splice(index, 1)
          }

          editor.destroy()
        })
      )
    })
  })

  idleCallbacks.add(observeTextEditorIdleCallbackId)
}

function deactivate () {
  idleCallbacks.forEach(window.cancelIdleCallback)
  idleCallbacks.clear()

  subscriptions.dispose()
}

// TODO: Ask why this doesn't have the word Linter in it (hehe)
// TODO: Clean this up and move to its own file
function provideUI () {
  return {
    name: 'linter-ui-plus',
    render: (difference: MessagesPatch) => {
      let resortFiles = false
      let resortMessagesByFile = new Set()

      for (const message of difference.added) {
        const file = $file(message)

        // Add file to group (if not present) and re-sort
        if (files.indexOf(file) < 0) {
          files.push(file)
          resortFiles = true
        }

        // Add message to its group (by file uri)
        if (messagesByFile.has(file)) {
          // $FlowFixMe
          messagesByFile.get(file).push(message)
        } else {
          messagesByFile.set(file, [message])
        }

        // Remember to resort
        resortMessagesByFile.add(file)

        // Increment counts
        messageCountsBySeverity[message.severity] += 1

        // Add message to active editors (if present) for this file
        const editorsAtPath = editorsByPath[file]
        if (editorsAtPath == null) continue

        for (const editorId of editorsAtPath) {
          editors[editorId].addMessage(message)
        }
      }

      for (const message of difference.removed) {
        const file = $file(message)

        // Remove message from its group (by file uri)
        if (messagesByFile.has(file)) {
          // $FlowFixMe
          const messages: LinterMessage[] = messagesByFile.get(file)

          const index = messages.indexOf(message)
          if (index >= 0) {
            messages.splice(index, 1)
          }

          if (messages.length === 0) {
            // If there are no more messages, remove
            messagesByFile.delete(file)
            files.splice(files.indexOf(file), 1)
            resortFiles = true
          } else {
            messagesByFile.set(file, messages)
          }
        }

        // Remember to resort
        resortMessagesByFile.add(file)

        // Decrement counts
        messageCountsBySeverity[message.severity] -= 1

        // Remove message from active editors (if present) for this file
        const editorsAtPath = editorsByPath[file]
        if (editorsAtPath == null) continue

        for (const editorId of editorsAtPath) {
          if (editors[editorId] != null) {
            editors[editorId].removeMessage(message)
          }
        }
      }

      // Preform resorts (if needed)
      if (resortFiles) files.sort()
      for (const file of resortMessagesByFile) {
        const messages = messagesByFile.get(file)
        if (messages != null) {
          messages.sort((a, b) => $range(a).compare($range(b)))
        }
      }

      // Update the panel (if created)
      if (panel != null) {
        // TODO: There should be a `.addMessage` and `.removeMessage`
        //       function instead
        panel.updateMessages(
          files,
          messagesByFile,
          messageCountsBySeverity
        )
      }

      // Update status bar (if created)
      if (statusBar != null) {
        statusBar.updateMessageCounts(messageCountsBySeverity)
      }
    },
    didBeginLinting (linter: Linter, filePath: string) {},
    didFinishLinting (linter: Linter, filePath: string) {},
    dispose () {}
  }
}

function togglePanel (refocus: boolean) {
  return () => {
    const paneContainer = atom.workspace.paneContainerForURI(WORKSPACE_URI)

    if (paneContainer && paneContainer.isVisible()) {
      if (getPanelInstance()._hasFocus || !refocus) {
        // IF the panel is visible _and_ focused, hide the panel
        atom.workspace.hide(WORKSPACE_URI)
      } else {
        // IF the panel is only visible, focus the panel
        // Activate the pane and focus its element
        atom.workspace.open(WORKSPACE_URI, { searchAllPanes: true })
        getPanelInstance().element.focus()
      }
    } else {
      // Start our selection in the panel on the current active text editor
      // if there is one
      // TODO: Do NOT change the selection if the currently selected
      //       message is in the active editor
      const activeTextEditor = atom.workspace.getActiveTextEditor()
      if (activeTextEditor != null) {
        didSelect(
          { file: activeTextEditor.getPath() },
          { collapsed: false }
        )
      }

      // If the panel is not visible, open it
      atom.workspace.open(WORKSPACE_URI, { searchAllPanes: true })
    }
  }
}

// Advance the active selection to the _next_ message
// TODO: This is a similar algo to panel::moveToNext but does not respect
//       the current filters. Refactor it and try and share as much
//       code as possible.
function moveToNext () {}

// Advance the active selection to the _previous_ message
function moveToPrevious () {}

function getPanelInstance () {
  if (panel == null) {
    if (Panel == null) {
      Panel = require('./components/panel')
    }

    panel = new Panel({
      onSelect: didSelect,
      files,
      messagesByFile,
      messageCountsBySeverity,
      selected
    })

    panel.onDidDestroy(() => {
      panel = null
    })
  }

  return panel
}

// A linter message (or file in the panel) was selected
async function didSelect (sel: ?Selected, options: ?SelectOptions) {
  selected = sel

  // When a linter message is selected ..
  if (sel != null && sel.message != null) {
    const position = $range(sel.message)

    // Open or activate file
    // TODO: Is it more performant to check if the active text editor
    //       is this file and just activate if not active?
    const editor = await atom.workspace.open(sel.file, {
      initialLine: position.start.row,
      initialColumn: position.start.column,
      pending: true,
      activatePane: (options && options.activate) || false,
      activateItem: true
    })

    // Select the relevant range
    editor.setSelectedBufferRange(position, {
      preserveFolds: false,
      reversed: true
    })
  }

  // Update selection on panel
  if (panel != null) {
    panel.updateSelected(selected, options)

    // Ensure that the panel is focused if the editor was not meant to
    // be focused
    // TODO: This bit is a touch confusing
    if (!options || !options.activate) {
      panel.element.focus()
    }
  }
}

function consumeStatusBar (statusBarRegistry: any) {
  if (statusBar == null) {
    if (StatusBar == null) {
      StatusBar = require('./components/status-bar')
    }

    statusBar = new StatusBar(statusBarRegistry, {
      messageCountsBySeverity,
      onClick: togglePanel(false)
    })
  }
}

module.exports = { activate, deactivate, provideUI, consumeStatusBar }
