/* @flow */
/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from "etch";
import EtchComponent from "../etch-component";
import cx from "classnames";
import {Message} from "../types";
import PanelSectionHeader from "./panel-section-header"
import PanelMessage from "./panel-message"

class PanelSection extends EtchComponent {
  props: {
    file: string,
    messages: Message[],
  };

  render () {
    const messages = this.props.messages.map((message) =>
      <PanelMessage {...message} />
    );

    return (
      <div className={cx('panel-section')}>
        <PanelSectionHeader file={this.props.file} count={this.props.messages.length} />
        {messages}
      </div>
    )
  }
}

export default PanelSection
