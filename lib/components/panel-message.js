/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import EtchComponent from '../etch-component'
import cx from 'classnames'
import padStart from "lodash/padStart"
import padEnd from "lodash/padEnd"
import { Message } from '../types';

class PanelMessage extends EtchComponent {
  props: Message

  render () {
    const { severity, location } = this.props
    const cn = cx('panel-message', `severity-${severity}`)
    return (
      <tr className={cn}>
        <td className="position-row">
          {location.position.start.row}
        </td>
        <td className="position-separator">{":"}</td>
        <td className="position-column">
          {location.position.start.column}
        </td>
        <td className="excerpt">
          {this.props.excerpt}
        </td>
      </tr>
    )
  }
}

export default PanelMessage
