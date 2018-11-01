import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import { TabBar, TabContent, TabContentItem } from 'commons/Tab'
import MonacoEditor from 'components/MonacoEditor'
import Editor from 'components/Editor'
import { TablessCodeEditor } from 'components/Editor/components/CodeEditor'
import MonacoTablessEditor from 'components/MonacoEditor/Editors/MonacoTablessEditor'
import i18n from 'utils/createI18n'
import config from 'config'
import pluginStore from 'components/Plugins/store'
import WelcomePage from './WelcomePage'
import Changelog from './Changelog'

const contextMenuItems = [
  {
    name: i18n`tab.contextMenu.close`,
    icon: '',
    command: 'tab:close'
  }, {
    name: i18n`tab.contextMenu.closeOthers`,
    icon: '',
    command: 'tab:close_other'
  }, {
    name: i18n`tab.contextMenu.closeAll`,
    icon: '',
    command: 'tab:close_all'
  },
  { isDivider: true },
  {
    name: i18n`tab.contextMenu.verticalSplit`,
    icon: '',
    command: 'tab:split_v'
  }, {
    name: i18n`tab.contextMenu.horizontalSplit`,
    icon: '',
    command: 'tab:split_h'
  }
]

@observer
class TabContainer extends Component {
  static propTypes = {
    containingPaneId: PropTypes.string,
    tabGroup: PropTypes.object,
    createGroup: PropTypes.func,
    closePane: PropTypes.func,
  };

  constructor (props) {
    super(props)
    this.state = {
      fullScreenActiveContent: config.isFullScreen,
    }
  }

  componentDidMount () {
    this.dispose = autorun(() => {
      this.setState({ fullScreenActiveContent: config.isFullScreen });
    })
  }

  handleFullScreen = () => {
    const { fullScreenActiveContent } = this.state
    this.setState({
      fullScreenActiveContent: !fullScreenActiveContent
    })
  }

  componentWillUnmount () {
    if (this.dispose) {
      console.log(this.dispose)
      this.dispose()
    }
  }
  render () {
    const { tabGroup, closePane } = this.props
    const { fullScreenActiveContent } = this.state
    if (!tabGroup) return null
    return (
      <div className={cx('tab-container', { fullscreen: fullScreenActiveContent })}>
        <TabBar tabGroup={tabGroup}
          contextMenuItems={contextMenuItems}
          closePane={closePane}
          handleFullScreen={this.handleFullScreen}
        />
        <TabContent tabGroup={tabGroup} >
          {tabGroup.tabs.length ? tabGroup.tabs.map(tab =>
            <TabContentItem key={tab.id} tab={tab}>
              {this.renderContent(tab)}
            </TabContentItem>
          )
          : <TabContentItem tab={{ isActive: true }}>
              <MonacoTablessEditor tabGroupId={tabGroup.id} />
            </TabContentItem>
          }
        </TabContent>
      </div>
    )
  }

  renderContent (tab) {
    if (tab.type === 'welcome') {
      return <WelcomePage />
    }
    if (tab.type === 'changelog') {
      return <Changelog />
    }
    if (tab.type && tab.type.startsWith('CUSTOM_EDITOR_VIEW')) {
      const pluginConfig = pluginStore.editorViews.get(tab.type)
      if (pluginConfig) {
        const { component: TargetComponent, ...other } = pluginConfig
        return <TargetComponent {...other} tab={tab} tabId={tab.id} />
      }
    }
    return <MonacoEditor tab={tab} active={tab.isActive} />
  }
}

export default TabContainer
