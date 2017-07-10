/* @flow */
/* @jsx etch.dom */

import type { TextBuffer } from 'atom'

// $FlowFixMe
import { TextEditor } from 'atom'

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('../etch')

type Props = {
  onSearch: () => *,
  buffer: TextBuffer
}

class PanelToolbarSearch {
  props: Props
  refs: {editor: TextEditor}

  constructor (props: Props) {
    this.props = props

    etch.initialize(this)

    this.refs.editor.onDidStopChanging(this.didStopChanging)
  }

  update () { }

  didStopChanging = () => {
    this.props.onSearch()
  }

  render () {
    return etch.dom(TextEditor, {
      ref: 'editor',
      mini: true,
      placeholderText: 'Search all messages',
      buffer: this.props.buffer
    })
  }
}

export default PanelToolbarSearch
