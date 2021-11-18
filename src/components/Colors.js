import Store from 'store'
import { Component } from 'utils/jsx'

import Item from 'components/Item'

export default class Colors extends Component {
  beforeRender () {
    this.handleEdit = this.handleEdit.bind(this)
  }

  template (props) {
    return (
      <section class='colors'>
        {
          Object.entries(Store.colors.get() || {}).map(([color, name]) => (
            <Item
              style={`--color: black; --background: ${color}`}
              colorable={false}
              sortable={false}
              deletable={false}
              data-color={color}
              name={name}
              event-blur={this.handleEdit}
              ref={this.refArray('items')}
            />
          ))
        }
      </section>
    )
  }

  get colors () {
    const colors = {}

    for (const item of this.refs.items || []) {
      const color = item.props['data-color']
      const { name } = item.toJson()
      colors[color] = name
    }

    return colors
  }

  handleEdit (item) {
    if (item.props.name === item.toJson().name) return
    Store.dirty.set(true)
  }
}
