/* @flow */
import { CompositeDisposable } from 'event-kit'
import { WORKSPACE_URI } from './constants'
import type { Linter, MessagesPatch } from './types'
import Panel from './panel'

class LinerUIPlusPackage {
  panel: ?Panel = null
  disposables = new CompositeDisposable()
  errors = 0
  warnings = 0
  infos = 0

  activate () {
    // Add an opener for the panel
    this.disposables.add(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_URI) {
          return this.getPanelInstance()
        }
      })
    )

    // Register commands to workspace (whole app)
    this.disposables.add(
      atom.commands.add('atom-workspace', {
        // Toggle the linter panel
        'linter-ui-plus:toggle-panel': () => this.togglePanel()
      })
    )

    // Register commands to panel
    this.disposables.add(
      atom.commands.add('.linter-ui-plus.panel', {
        // Toggle the linter panel
        'linter-ui-plus:open-selected-entry': () => {
          if (this.panel) {
            this.panel.openSelected()
          }
        },
        'core:move-up': () => {
          if (this.panel) {
            this.panel.movePrevious()
          }
        },
        'core:move-down': () => {
          if (this.panel) {
            this.panel.moveNext()
          }
        }
      })
    )

    return null
  }

  deactivate () {
    this.disposables.dispose()

    if (this.panel) {
      this.panel.destroy()
      this.panel = null
    }
  }

  provideUI () {
    return {
      name: 'linter-ui-plus',
      render: (difference: MessagesPatch) => {
        this.updateMessages(difference)
        this.getPanelInstance().updateMessageTotals(
          this.errors,
          this.warnings,
          this.infos
        )

        // Roll this into ^
        this.getPanelInstance().updateMessages(difference)
      },
      didBeginLinting (linter: Linter, filePath: string) {},
      didFinishLinting (linter: Linter, filePath: string) {},
      dispose () {}
    }
  }

  updateMessages (difference: MessagesPatch) {
    for (let message of difference.added) {
      // Update message totals
      switch (message.severity) {
        case "error":
          this.errors += 1
          break

        case "warning":
          this.warnings += 1
          break

        case "info":
          this.infos += 1
          break
      }
    }

    for (let message of difference.removed) {
      // Update message totals
      switch (message.severity) {
        case "error":
          this.errors -= 1
          break

        case "warning":
          this.warnings -= 1
          break

        case "info":
          this.infos -= 1
          break
      }
    }
  }

  getPanelInstance () {
    if (this.panel == null) {
      this.panel = new Panel({})
    }

    return this.panel
  }

  togglePanel () {
    const panel = atom.workspace.paneContainerForURI(WORKSPACE_URI)

    if (panel && panel.isVisible() && this.getPanelInstance()._hasFocus) {
      // Hide the item if we toggled the linter panel when we had focus
      atom.workspace.hide(WORKSPACE_URI)
    } else if (panel && panel.isVisible()) {
      // Activate the pane
      atom.workspace.open(WORKSPACE_URI, {
        searchAllPanes: true,
        activatePane: true,
        activateItem: true
      })

      // Make sure we are focusing the panel in the pane
      this.getPanelInstance().element.focus()
    } else {
      // Set our selection to the file of the current active text editor
      // if there is one
      const activeTextEditor = atom.workspace.getActiveTextEditor()
      if (activeTextEditor != null) {
        this.getPanelInstance().didSelectFile(activeTextEditor.getPath(), false)
      }

      // Open the panel (and bring focus to it)
      atom.workspace.open(WORKSPACE_URI, {
        searchAllPanes: true,
        activatePane: true,
        activateItem: true
      })
    }
  }
}

export default LinerUIPlusPackage
