/* @flow */
import path from 'path'
import { CompositeDisposable } from 'event-kit'
import { WORKSPACE_URI } from './constants'
import type { Linter, MessagesPatch } from './types'
import Panel from './panel'

class LinerUIPlusPackage {
  service: ?Service = null
  panel: ?Panel = null
  disposables = new CompositeDisposable()

  activate () {
    // Add an opener for the panel
    this.disposables.add(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_URI) {
          return this.getPanelInstance()
        }
      })
    )

    // Initially create the linter panel
    this.createOrDestroyPanelIfNeeded()

    // Register commands to workspace (whole app)
    this.disposables.add(
      atom.commands.add('atom-workspace', {
        // Toggle the linter panel
        'linter-ui-plus:toggle': () => this.togglePanel()
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
        }
      })
    )

    // When the project changes, we may want to destroy the linter panel
    this.disposables.add(
      atom.project.onDidChangePaths(
        this.createOrDestroyPanelIfNeeded.bind(this)
      )
    )

    return null
  }

  deactivate () {
    this.disposables.dispose()

    if (this.panel) {
      this.panel.destroy()
      this.panel = null
    }

    if (this.service) {
      this.service.dispose()
      this.service = null
    }
  }

  provideUI () {
    return {
      name: 'linter-ui-plus',
      render: (difference: MessagesPatch) => {
        if (this.panel) {
          this.panel.updateMessages(difference)
        }
      },
      didBeginLinting (linter: Linter, filePath: string) {},
      didFinishLinting (linter: Linter, filePath: string) {},
      dispose () {}
    }
  }

  getPanelInstance () {
    if (this.panel == null) {
      this.panel = new Panel({})
    }

    return this.panel
  }

  togglePanel () {
    atom.workspace.toggle(WORKSPACE_URI)
  }

  createOrDestroyPanelIfNeeded () {
    if (this.shouldAttachPanel()) {
      atom.workspace.open(WORKSPACE_URI, {
        activatePane: true,
        activateItem: true
      })
    } else if (this.panel) {
      const pane = atom.workspace.paneForItem(this.panel)
      if (pane) pane.removeItem(this.panel)
      this.panel = null
    }
  }

  shouldAttachPanel () {
    if (atom.project.getPaths().length === 0) return false

    // Avoid opening if Atom was opened as the Git editor...
    // Only show it if the .git folder was explicitly opened.
    if (path.basename(atom.project.getPaths()[0]) === '.git') {
      return atom.project.getPaths()[0] === atom.getLoadSettings().pathToOpen
    }

    return true
  }
}

export default LinerUIPlusPackage
