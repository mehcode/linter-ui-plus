/* @flow */

import type {TextEditor} from 'atom'
import type {LinterMessage} from '@atom/linter'
import type Editor from './editor'

const $ = require('lazy-cache')(require)
$('./Editor', 'Editor')
$('./util', 'util')

class EditorRegistry {
  idleCallback: ?mixed
  editors: Map<number, Editor> = new Map()
  editorsByPath: Map<string, number> = new Map()
  messagesByFile: Map<string, LinterMessage[]>

  constructor (messagesByFile: Map<string, LinterMessage[]>) {
    this.messagesByFile = messagesByFile

    // Wait for an idle period to initialize the editor registry
    this.idleCallback = window.requestIdleCallback(this.initialize)
  }

  initialize = () => {
    // Register observer for opened text editors. We need to watch
    // text editors in order to add buffer and marker decorations.
    atom.workspace.observeTextEditors(this.didAddTextEditor)
  }

  dispose () {
    // Destroy all active editors
    this.editors.forEach((editor) => editor.destroy())
    this.editors.clear()
    this.editorsByPath.clear()

    // Cancel the idle callback to observe text editors if it
    // has not yet occurred
    if (this.idleCallback != null) {
      window.cancelIdleCallback(this.idleCallback)

      this.idleCallback = null
    }
  }

  didAddTextEditor = (textEditor: TextEditor) => {
    // if (Editor == null) {
    //   Editor = require('./editor')
    // }

    // Initialize a new editor; pass in any messages we have right now
    // for its file path
    const path = textEditor.getPath()
    const initialMessages = this.messagesByFile.get(path)
    const editor = new $.Editor(textEditor, initialMessages || [])

    // Store editor by id
    this.editors.set(textEditor.id, editor)

    // Store the editor's id by path for easier updating when
    // new messasges come in
    const editorsAtPath = this.editorsByPath.get(path)
    if (editorsAtPath == null) {
      this.editorsByPath.set(path, [textEditor.id])
    } else {
      editorsAtPath.push(textEditor.id)
    }

    // Track when the editor is destroyed to remove it from our maps
    editor.onDidDestroy(() => {
      this.editors.delete(textEditor.id)

      const editorsAtPath = this.editorsByPath.get(path)
      if (editorsAtPath != null) {
        const index = editorsAtPath.indexOf(textEditor.id)
        editorsAtPath.splice(index, 1)
      }
    })

    // When the text editor changes its path _or_ grammar,
    // we need to destroy and re-create the text editor
    editor.subscriptions.add(textEditor.onDidChangePath(() => {
      editor.destroy()
      this.didAddTextEditor(textEditor)
    }))

    editor.subscriptions.add(textEditor.onDidChangeGrammar(() => {
      editor.destroy()
      this.didAddTextEditor(textEditor)
    }))
  }

  apply (action: "remove" | "add") {
    return (message: LinterMessage) => {
      console.log("{reg}", action, message)
      const editorsAtPath = this.editorsByPath.get($.util.$file(message))
      console.log(" -> found editorsAtPath: ", editorsAtPath)
      if (editorsAtPath != null) {
        for (const editorId of editorsAtPath) {
          const editor = this.editors.get(editorId)
          if (editor != null) {
            console.log(" -> actually act")
            editor[`${action}Message`](message)
          }
        }
      }
    }
  }

  addMessage = this.apply("add")
  removeMessage = this.apply("remove")
}

module.exports = EditorRegistry
