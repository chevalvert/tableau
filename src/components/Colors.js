import Store from 'store'
import { Component } from 'utils/jsx'

import Item from 'components/Item'
import Button from 'components/Button'

export default class Colors extends Component {
  beforeRender () {
    this.handleEdit = this.handleEdit.bind(this)
  }

  template (props) {
    return (
      <section class='colors' store-class-has-highlighted={Store.highlighted}>
        {
          Object.entries(Store.colors.get() || {}).map(([color, name]) => {
            const highlighted = Store.highlighted.current && Store.highlighted.current.match(name)
            return (
              <Item
                style={`--color: black; --background: ${color}`}
                colorable={false}
                sortable={false}
                deletable={false}
                highlighted={highlighted}
                data-color={color}
                name={name}
                event-blur={this.handleEdit}
                ref={this.refArray('items')}
              >
                {name && (
                  <Button
                    icon={highlighted ? 'hidden' : 'preview'}
                    event-click={() => this.handlePreview(name)}
                  />
                )}
              </Item>
            )
          })
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

  handlePreview (name) {
    window.location.href = Store.highlighted.current && Store.highlighted.current.match(name)
      ? window.location.origin
      : window.location.origin + '?' + name
  }
}
