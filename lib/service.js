/* @flow */
import { Emitter } from 'event-kit'
import type { Linter, MessagesPatch } from './types'

class LinterUIPlusService {
  name = 'LinterUIPlusService'
  emitter = new Emitter()

  onRender (callback: MessagesPatch => *) {
    this.emitter.on('render', callback)
  }

  render (difference: MessagesPatch) {
    this.emitter.emit('render', difference)
  }

  didBeginLinting (linter: Linter, filePath: string) {}

  didFinishLinting (linter: Linter, filePath: string) {}

  dispose () {}
}

export default LinterUIPlusService
