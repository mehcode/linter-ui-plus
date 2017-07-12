/* @flow */
/* @jsx etch.dom */

import type { LinterMessageDescription } from '@atom/linter'

const lazyImport = require('import-lazy')(require)
const etch = lazyImport('../etch')
const marked = lazyImport('marked')

type Props = {
  description: LinterMessageDescription,
}

class PanelMessage {
  props: Props
  element: any

  constructor (props: Props) {
    this.props = props

    etch.initialize(this)
  }

  update (props: Props) {
    this.props = props

    return etch.update(this)
  }

  render () {
    const { description } = this.props

    // TODO: If the descrition requires resolution, resolve it
    const rendered = marked(description)

    return (
      <tr className='panel-message-description'>
        <td colSpan='7' className='description' innerHTML={rendered} />
      </tr>
    )
  }
}

export default PanelMessage
