import Store from 'store'
import { Component } from 'utils/jsx'
import cuid from 'cuid'

import Sortable from 'sortablejs'
import Item from 'components/Item'

export default class Items extends Component {
  beforeRender (props) {
    this.handleAdd = this.handleAdd.bind(this)
    this.handleSort = this.handleSort.bind(this)
  }

  template (props, state) {
    return (
      <section class='items'>
        <ul class='items__columns'>
          {
            Store.columns.get().map((title, index) => (
              <li class='items__column'>
                <h2>{title}</h2>
                <ul class='items__items' data-column={index} ref={this.refArray('columns')}>
                  {
                    props.items.filter(item => item.column === index).map(item => {
                      const id = cuid()
                      return (
                        <Item
                          id={id}
                          {...item}
                          ref={this.refMap(id, 'items')}
                          event-blur={() => Store.dirty.set(true)}
                          event-delete={() => Store.dirty.set(true)}
                        />
                      )
                    })
                  }
                </ul>
                <Item
                  class='item--add'
                  placeholder='Nouvelle tâche'
                  ref={this.refMap(index, 'adders')}
                  column={index}
                  sortable={false}
                  deletable={false}
                  event-blur={this.handleAdd}
                />
              </li>
            ))
          }
        </ul>
      </section>
    )
  }

  get items () {
    return this.refs.items
      ? Array.from(this.refs.items.values()).sort((a, b) => a.DOMIndex - b.DOMIndex).map(item => item.toJson())
      : []
  }

  afterMount () {
    this.sortables = this.refs.columns.map((column, index) => {
      return Sortable.create(column, {
        group: 'column',
        handle: '.item__handle',
        onEnd: this.handleSort
      })
    })
  }

  handleAdd (item) {
    const json = item.toJson()
    if (!json.name) return

    const input = this.refs.adders.get(json.column)
    if (input) input.refs.content.textContent = ''

    const id = cuid()
    this.render((
      <Item
        id={id}
        {...json}
        ref={this.refMap(id, 'items')}
        event-blur={() => Store.dirty.set(true)}
        event-delete={() => Store.dirty.set(true)}
      />
    ), this.refs.columns[json.column])

    Store.dirty.set(true)
  }

  handleSort (e) {
    const item = this.refs.items.get(e.item.id)
    item.state.column.set(parseInt(e.to.dataset.column))
    Store.dirty.set(true)
  }

  beforeDestroy () {
    this.sortables.forEach(sortable => sortable.destroy())
  }
}
