/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'

class EtchComponent {
  constructor (props) {
    this.props = props

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  destroy () {
    return etch.destroy(this)
  }
}

export default EtchComponent
