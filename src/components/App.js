import Store from 'store'
import { Component } from 'utils/jsx'
import { derived } from 'utils/state'

import Colors from 'components/Colors'
import Icon from 'components/Icon'
import Items from 'components/Items'
import Login from 'components/Login'
import Timeline from 'components/Timeline'

// Cache scroll so that app can render without jumps
let _scrollTop = 0

export default class App extends Component {
  beforeRender () {
    this.update = this.update.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.state = {
      hasFilter: derived(Store.filter, names => names && names.length)
    }
  }

  template (props, state) {
    return (
      <main
        id='App'
        class='app'
        store-class-is-dirty={Store.dirty}
        store-class-has-filter={state.hasFilter}
        store-class-is-authenticated={Store.authenticated}
      >
        <Icon name='loader' class='icon--dirty' />
        <Login />
      </main>
    )
  }

  afterMount () {
    this.update()

    document.addEventListener('scroll', this.handleScroll)

    Store.items.subscribe(this.update)
    Store.columns.subscribe(this.update)
    Store.colors.subscribe(this.update)
    Store.filter.subscribe(this.update)
  }

  update () {
    if (this.refs.items) this.refs.items.destroy()
    if (this.refs.colors) this.refs.colors.destroy()
    if (this.refs.timeline) this.refs.timeline.destroy()

    this.render(<Items ref={this.ref('items')} />, this.base)
    this.render(<Colors ref={this.ref('colors')} />, this.base)
    this.render(<Timeline ref={this.ref('timeline')} />, this.base)

    document.documentElement.scrollTop = _scrollTop
  }

  handleScroll (e) {
    _scrollTop = document.documentElement.scrollTop
  }
}
