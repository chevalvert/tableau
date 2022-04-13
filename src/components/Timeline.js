import Store from 'store'
import { Component } from 'utils/jsx'
import { Sortable } from 'sortablejs/modular/sortable.core.esm.js'
import hash from 'object-hash'
import groupBy from 'utils/array-group-by'
import { clamp, map } from 'missing-math'
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

    const voids = []
    for (const [columnIndex, items] of Object.entries(groupBy(Store.items.current.filter(item => !item.timeline), 'column'))) {
      voids.push(
        <ul
          class='timeline__void'
          ref={this.refArray('voids')}
          data-label={Store.columns.current[columnIndex]}
        >
          {items.map(item => <Item data={item} sortable />)}
        </ul>
      )
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
              <li class='fake item' />
            </ul>
          </div>
        </div>
        <div class='timeline__voids' ref={this.ref('void')}>{voids}</div>
      </section>
    )
  }

  afterMount () {
    this.refs.scrollable.scrollTop = _scrollTop
    this.refs.scrollable.scrollLeft = _scrollLeft

    this.sortables = []
    for (const ref of [this.refs.timeline, ...this.refs.voids || []]) {
      this.sortables.push(Sortable.create(ref, {
        group: 'timeline',
        handle: '.item__handle',
        axis: 'vertical',
        onStart: () => this.base.classList.add('has-sorting'),
        onEnd: this.handleSort
      }))
    }
  }

  handleSort (e) {
    this.base.classList.remove('has-sorting')
    if (!this.refs) return

    const previous = hash(Store.items.get())

    Store.items.update(items => {
      const find = id => items.find(item => item.index === +id)
      const current = find(e.item.id)

      // Update item timeline range
      if (current) {
        if (!current.timeline) current.timeline = {}

        const left = e.originalEvent.clientX + this.refs.scrollable.scrollLeft
        const d = Math.floor(map(left, 0, e.item.parentNode.offsetWidth, 0, 48)) - (current.timeline.start || 0)

        current.timeline.start = clamp((current.timeline.start || 0) + d, 0, 48)
        current.timeline.end = current.timeline.end
          ? clamp(current.timeline.end + d, 0, 48)
          : current.timeline.start + 4
      }

      // Handle item dropped into the void
      if (current && this.refs.voids.includes(e.to)) delete current.timeline

      // Update all items indexes
      let index = 0
      for (const { id } of this.refs.timeline.querySelectorAll('.item:not(.fake)')) {
        const item = find(id)
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
