/* @flow */
import path from 'path'
import { CompositeDisposable } from 'event-kit'
import Service from './service'
import Panel from './panel'

class LinerUIPlusPackage {
  service: ?Service = null
  panel: ?Panel = null
  disposables = new CompositeDisposable()

  activate () {
    // Initially create the linter panel
    this.createOrDestroyPanelIfNeeded()

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

  provideUI (): Service {
    if (this.service == null) {
      this.service = new Service()
      this.service.onRender(patch => {
        // TODO: Use the patch better and use add/remove ?
        this.panel.update({ messages: patch.messages })
      })
    }

    return this.service
  }

  getPanelInstance () {
    if (this.panel == null) {
      this.panel = new Panel({})
    }

    return this.panel
  }

  createOrDestroyPanelIfNeeded () {
    if (this.shouldAttachPanel()) {
      const panel = this.getPanelInstance()
      atom.workspace.open(panel, {
        // TODO: Make these both false
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
