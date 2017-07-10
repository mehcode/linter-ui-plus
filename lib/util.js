/* @flow */

import type { LinterMessage } from '@atom/linter'

function $range (message: LinterMessage) {
  return message.version === 1 ? message.range : message.location.position
}

function $file (message: LinterMessage) {
  return message.version === 1 ? message.filePath : message.location.file
}

function $excerpt (message: LinterMessage) {
  return message.version === 1 ? message.text : message.excerpt
}

module.exports = {$file, $range, $excerpt}
