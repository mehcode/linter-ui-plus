/* @flow */

import type { TextEditor, Point, Range } from 'atom'

declare module '@atom/linter' {
  declare type Severity = 'error' | 'warning' | 'info'

  declare type LinterMessageDescription = string | (() => Promise<string> | string)

  declare type Message = {
    // Automatically added by linter
    key: string,
    version: 2,
    linterName: string,

    // From providers
    location: {
      file: string,
      position: Range
    },
    reference?: {
      file: string,
      position?: Point
    },
    url?: string,
    icon?: string,
    excerpt: string,
    severity: Severity,
    solutions?: Array<| {
        title?: string,
        position: Range,
        priority?: number,
        currentText?: string,
        replaceWith: string
      }
      | {
        title?: string,
        priority?: number,
        position: Range,
        apply: () => any
      }>,
    description?: LinterMessageDescription
  }

  declare type MessageLegacy = {
    // Automatically added by Linter
    key: string,
    version: 1,
    linterName: string,

    // From providers
    type: string,
    icon?: string,
    text?: string,
    html?: string,
    filePath?: string,
    range?: Range,
    class?: string,
    severity: 'error' | 'warning' | 'info',
    trace?: Array<MessageLegacy>,
    fix?: {
      range: Range,
      newText: string,
      oldText?: string
    }
  }

  declare type LinterMessage = Message | MessageLegacy

  declare type Linter = {
    // Automatically added
    __$sb_linter_version: number,
    __$sb_linter_activated: boolean,
    __$sb_linter_request_latest: number,
    __$sb_linter_request_last_received: number,

    // From providers
    name: string,
    scope: 'file' | 'project',
    lintOnFly: boolean,
    grammarScopes: Array<string>,
    lint: (
      textEditor: TextEditor
    ) =>
      | ?Array<Message | MessageLegacy>
      | Promise<?Array<Message | MessageLegacy>>
  }

  declare type MessagesPatch = {
    added: Array<Message | MessageLegacy>,
    removed: Array<Message | MessageLegacy>,
    messages: Array<Message | MessageLegacy>
  }

  declare type TreeViewHighlight = {
    info: boolean,
    error: boolean,
    warning: boolean
  }
}
