import Store from 'store'
import { Component } from 'utils/jsx'
import hash from 'object-hash'
import { Sortable, AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'

import Item from 'components/Item'

Sortable.mount(new AutoScroll())

// Cache scroll so that app can render without jumps
let _scrollLeft = 0

export default class Items extends Component {
  beforeRender (props) {
    this.handleAdd = this.handleAdd.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.handleSort = this.handleSort.bind(this)
  }

  template (props, state) {
    return (
      <section class='items'>
        <ul
          class='items__columns'
          ref={this.ref('scrollable')}
          event-scroll={this.handleScroll}
        >
          {
            Store.columns.get().map((title, index) => (
              <li class='items__column'>
                <h2>{title}</h2>
                <ul class='items__items' data-column={index} ref={this.refArray('columns')}>
                  {
                    Store.items.current.map(item => item.column === index && (
                      <Item data={item} deletable sortable colorable />
                    ))
                  }
                </ul>
                <form event-submit={this.handleAdd(index)}>
                  <input type='text' placeholder='Nouvelle tâche' />
                </form>
              </li>
            ))
          }
        </ul>
      </section>
    )
  }

  afterMount () {
    if (!this.refs.columns) return

    this.refs.scrollable.scrollLeft = _scrollLeft

    this.sortables = this.refs.columns.map((column, index) => {
      return Sortable.create(column, {
        group: 'column',
        handle: '.item__handle',
        onEnd: this.handleSort,
        scroll: true,
        scrollSensitivity: 100, // px, how near the mouse must be to an edge to start scrolling.
        scrollSpeed: 10, // px, speed of the scrolling
        bubbleScroll: true // apply autoscroll to all parent elements, allowing for easier movement
      })
    })
  }

  handleScroll (e) {
    _scrollLeft = this.refs.scrollable.scrollLeft
  }

  handleAdd (column) {
    return e => {
      e.preventDefault()
      const input = e.target.querySelector('input')
      if (!input || !input.value) return
      Store.items.update(items => {
        items.push({ name: input.value, column })
        return items
      }, true)
      Store.dirty.set(true)
    }
  }

  handleSort (e) {
    const previous = hash(Store.items.get())

    // Re-create the items array based on DOM order
    const items = []
    for (const column of this.refs.columns) {
      for (const { id } of column.querySelectorAll('.item')) {
        const item = Store.items.current.find(item => item.index === +id)

        // Ensure current dropped item column is updated
        if (id === e.item.id) item.column = parseInt(e.to.dataset.column)

        items.push(item)
      }
    }

    // Update the Store only if needed
    if (hash(items) === previous) return

    Store.items.set(items)
    Store.dirty.set(true)
  }

  beforeDestroy () {
    ;(this.sortables || []).forEach(sortable => sortable.destroy())
  }
}
