/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from "etch";
import EtchComponent from "../etch-component";
import cx from "classnames";
import {Message} from "../types";

class PanelMessage extends EtchComponent {
  props: Message;

  render () {
    const {message, severity, location} = this.props;
    const cn = cx("panel-message", `severity-${severity}`)
    return (
      <div className={cn}>
        <span>
          {this.props.excerpt}
        </span>
        <span className="position">
          {`${location.position.start}`}
        </span>
      </div>
    )
  }
}

export default PanelMessage
