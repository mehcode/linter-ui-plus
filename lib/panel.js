/* @jsx etch.dom */
/* eslint react/no-unknown-property: "off" */

import etch from 'etch'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import { WORKSPACE_URI } from './constants'
import PanelSectionHeader from './components/panel-section-header'
import PanelMessage from './components/panel-message'
import PanelSection from './components/panel-section'

class Panel {
  constructor (props) {
    this.props = props

    etch.initialize(this)
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  getURI () {
    return WORKSPACE_URI
  }

  getTitle () {
    return 'Linter'
  }

  getDefaultLocation () {
    return 'bottom'
  }

  getAllowedLocations () {
    return ['center', 'bottom', 'top']
  }

  getPreferredHeight () {
    return 200
  }

  render () {
    const messages = this.props.messages || []

    // Group messages by file
    const messagesByFile = groupBy(messages, 'location.file')

    // Instantiate a section for each file
    const sections = map(messagesByFile, (messages, file) =>
      <PanelSection file={file} messages={messages} />
    )

    return (
      <div class="linter-ui-plus panel">
        {sections}
        {/* <PanelSectionHeader expanded filename="panel.js" path="lib/components" count={1} />
        <PanelSectionHeader filename="panel.js" path="tests" count={31} />
        <PanelSectionHeader filename="types.js" count={3} />
        <PanelMessage level="error" message={`comment on exported function PostContact should be of the form "PostContact ..."`} /> */}
      </div>
    )
  }
}

export default Panel
