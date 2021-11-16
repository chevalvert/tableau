import Store from 'store'
import { Component } from 'utils/jsx'

import Icon from 'components/Icon'
import Items from 'components/Items'
import Login from 'components/Login'

export default class App extends Component {
  beforeRender () {
    this.update = this.update.bind(this)
  }

  template (props) {
    return (
      <main
        id='App'
        class='app'
        store-class-is-dirty={Store.dirty}
        store-class-is-authenticated={Store.authenticated}
      >
        <Icon name='loader' class='icon--dirty' />
        <Login />
      </main>
    )
  }

  get items () {
    return (this.refs.items && this.refs.items.items) || []
  }

  afterMount () {
    this.update()
    Store.items.subscribe(this.update)
  }

  update () {
    if (this.refs.items) this.refs.items.destroy()
    this.render(<Items ref={this.ref('items')} items={Store.items.get()} />, this.base)
  }
}
