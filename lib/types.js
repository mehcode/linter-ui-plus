/* @flow */

import type { LinterMessage } from '@atom/linter'

export type Selected = {
  file: string,
  message?: LinterMessage,
  index?: number,
}

export type SelectOptions = {
  // Set the collapsed state of the selected file, `null` to toggle
  collapsed?: ?boolean,

  // Activate the editor if a message is selected
  activate?: boolean,
}
