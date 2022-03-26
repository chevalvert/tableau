import Store from 'store'
import { Component } from 'utils/jsx'
import Sortable from 'sortablejs'
import hash from 'object-hash'
import Item from 'components/Item'

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
]

const YEAR_PROGRESS = (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (new Date(new Date().getFullYear() + 1, 0, 1).getTime() - new Date(new Date().getFullYear(), 0, 1).getTime())

// Cache scroll so that app can render without jumps
let _scrollTop = 0
let _scrollLeft = 0

export default class Timeline extends Component {
  beforeRender (props) {
    this.handleSort = this.handleSort.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  template (props, state) {
    const ticks = []
    let week = 0
    for (const month of MONTHS) {
      for (let i = 0; i < 4; i++) {
        ticks.push({ month, week: week++ })
      }
    }

    return (
      <section class='timeline'>
        <div
          class='timeline__scrollable'
          event-scroll={this.handleScroll}
          ref={this.ref('scrollable')}
        >
          <div class='timeline__content'>
            <div class='timeline__current' style={`--start:${YEAR_PROGRESS}`} />
            <div class='timeline__months'>
              {
                MONTHS.map(month => (
                  <div class='timeline__month' data-month={month}>
                    <div class='timeline__week' />
                    <div class='timeline__week' />
                    <div class='timeline__week' />
                    <div class='timeline__week' />
                  </div>
                ))
              }
            </div>
            <div class='timeline__ticks'>
              {
                MONTHS.map(month => (
                  <div class='timeline__month'>
                    <div class='timeline__week' />
                    <div class='timeline__week' />
                    <div class='timeline__week' />
                    <div class='timeline__week' />
                  </div>
                ))
              }
            </div>
            <ul
              class='timeline__items'
              ref={this.ref('timeline')}
            >
              {
                Store.items.current
                  .filter(item => item.timeline)
                  .sort((a, b) => a.timeline.index - b.timeline.index)
                  .map(item => <Item data={item} sortable resizable />)
              }
            </ul>
          </div>
        </div>
        <div
          class='timeline__void'
          ref={this.ref('void')}
        >
          {
            Store.items.current
              .filter(item => !item.timeline)
              .map(item => <Item data={item} sortable />)
          }
        </div>
      </section>
    )
  }

  afterMount () {
    this.refs.scrollable.scrollTop = _scrollTop
    this.refs.scrollable.scrollLeft = _scrollLeft

    this.sortables = []
    for (const ref of [this.refs.timeline, this.refs.void]) {
      this.sortables.push(Sortable.create(ref, {
        group: 'timeline',
        handle: '.item__handle',
        onEnd: this.handleSort
      }))
    }
  }

  handleSort (e) {
    const previous = hash(Store.items.get())

    Store.items.update(items => {
      const find = id => items.find(item => item.index === +id)

      // Handle item dropped into the void
      if (e.to === this.refs.void) {
        const item = find(e.item.id)
        if (item) delete item.timeline
      }

      // Update timeline indexes
      let index = 0
      for (const { id } of this.refs.timeline.querySelectorAll('.item')) {
        const item = find(id)
        item.timeline = item.timeline || { start: 48 * YEAR_PROGRESS, end: 48 * YEAR_PROGRESS + 4 }
        item.timeline.index = index++
      }

      return items
    }, true)

    // Update the Store only if needed
    Store.dirty.set(hash(Store.items.current) !== previous)
  }

  handleScroll (e) {
    _scrollTop = this.refs.scrollable.scrollTop
    _scrollLeft = this.refs.scrollable.scrollLeft
  }

  beforeDestroy () {
    this.sortables.forEach(sortable => sortable.destroy())
  }
}
