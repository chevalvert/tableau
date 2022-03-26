import Store from 'store'
import { Component } from 'utils/jsx'
import { derived, writable } from 'utils/state'
import { clamp, map } from 'missing-math'
import classnames from 'classnames'
import hash from 'object-hash'

import Button from 'components/Button'
import Icon from 'components/Icon'

const FILTER = {
  or: function () {
    const names = Store.filter.get()
    if (!names) return

    // WARNING: potential memory leak
    if (!this.state) return

    const { colors } = this.state.data.get()
    if (!colors) return

    for (const hex of (colors || [])) {
      const color = Store.colors.current[hex]
      if (color && names.includes(color.toLowerCase())) return true
    }
  },

  and: function () {
    const names = Store.filter.get()
    if (!names) return

    // WARNING: potential memory leak
    if (!this.state) return

    const { colors } = this.state.data.get()
    if (!colors) return

    const itemNames = []
    for (const hex in Store.colors.get()) {
      if (colors.includes(hex)) itemNames.push(Store.colors.current[hex].toLowerCase())
    }

    for (const name of names) {
      if (!itemNames.includes(name)) return false
    }

    return true
  }
}

export default class Item extends Component {
  beforeRender (props) {
    this.handleData = this.handleData.bind(this)

    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleColor = this.handleColor.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleBlur = this.handleBlur.bind(this)

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)

    this.handleDelete = this.handleDelete.bind(this)

    this.state = {
      data: writable(props.data || {}),

      hasFocus: writable(false),
      isResizing: writable(false),
      isFiltered: undefined // See below
    }

    this.state.isFiltered = derived(Store.filter, FILTER.and.bind(this))
  }

  template (props, state) {
    const { name, colors, index, timeline = {} } = state.data.get()

    return (
      <li
        id={index}
        class={classnames('item', props.class)}
        store-class-has-focus={this.state.hasFocus}
        store-class-is-filtered={this.state.isFiltered}
        store-class-is-resizing={this.state.isResizing}
        style={`
          --start: ${timeline.start};
          --end: ${timeline.end};
        `}
      >
        {props.resizable && (
          ['before', 'after'].map(side => (
            <div
              class='item__resize-handle'
              data-side={side}
              event-mousedown={this.handleMouseDown}
            />
          ))
        )}
        {props.sortable && <Icon name='bars' class='item__handle' />}
        <div
          contentEditable
          placeholder={props.placeholder}
          class='item__name'
          ref={this.ref('content')}
          event-keydown={this.handleKeydown}
          event-focus={this.handleFocus}
          event-blur={this.handleBlur}
        >
          {name}
        </div>
        {props.colorable && (
          <div class='item__colors'>
            {
              Array.from(new Set([
                ...Object.keys(Store.colors.get()),
                ...(colors || [])
              ])).map(color => (
                <input
                  type='checkbox'
                  style={`--color: ${color}`}
                  checked={colors && colors.includes(color)}
                  event-change={this.handleColor(color)}
                />
              ))
            }
          </div>
        )}
        <div class='item__buttons'>
          {props.children}
          {props.deletable && <Button icon='trash' class='button--trash' event-click={this.handleDelete} />}
        </div>
      </li>
    )
  }

  afterMount () {
    this.state.data.subscribe(this.handleData)
    this.applyResize(this.state.data.current.timeline)

    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('mouseleave', this.handleMouseUp)
  }

  applyResize (timeline) {
    if (!timeline) return
    this.base.style.setProperty('--start', timeline.start)
    this.base.style.setProperty('--end', timeline.end)
    this.base.classList.toggle('is-small', timeline.end - timeline.start < 3)
    this.base.classList.toggle('is-large', timeline.end - timeline.start > 10)
  }

  handleData (data) {
    // Do nothing if data is unchanged
    if (hash(data) === hash(this.state.data.previous)) return

    // Find and update the matching item in the Store
    Store.items.update(items => {
      if (data.deleted) delete items[data.index]

      const item = items[data.index] || {}
      for (const k in data) item[k] = data[k]

      return items
    }, true)

    // Set the Store as dirty, which will trigger a database update
    Store.dirty.set(true)
  }

  handleKeydown (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.refs.content.blur()
    }
  }

  handleColor (color) {
    return e => this.state.data.update(data => {
      // Ensure data.colors exists
      data.colors = data.colors || []

      // Insert or remove color based on input checked
      if (e.target.checked) data.colors.push(color)
      else data.colors.splice(data.colors.indexOf(color), 1)

      // Ensure data.colors is deduped
      data.colors = Array.from(new Set([...data.colors]))

      return data
    }, true)
  }

  handleFocus () {
    this.state.hasFocus.set(true)
  }

  handleBlur () {
    this.refs.content.scrollLeft = 0
    this.state.hasFocus.set(false)

    // Update data.name
    this.state.data.update(data => {
      data.name = this.refs.content.textContent
      return data
    }, true)
  }

  handleMouseDown (e) {
    this.state.isResizing.set(true)

    this.refs.dragged = e.target
    this.refs.dragged.start = e.pageX
    this.refs.dragged.initialLeft = this.base.offsetLeft
    this.refs.dragged.initialWidth = this.base.offsetWidth
  }

  handleMouseMove (e) {
    if (!this.refs.dragged) return
    const deltaX = e.pageX - this.refs.dragged.start

    let left
    let width

    if (this.refs.dragged.dataset.side === 'before') {
      left = this.refs.dragged.initialLeft + deltaX
      width = e.shiftKey
        ? this.refs.dragged.initialWidth
        : (this.refs.dragged.initialWidth - deltaX)
    }

    if (this.refs.dragged.dataset.side === 'after') {
      left = e.shiftKey
        ? this.refs.dragged.initialLeft + deltaX
        : this.refs.dragged.initialLeft
      width = e.shiftKey
        ? this.refs.dragged.initialWidth
        : this.refs.dragged.initialWidth + deltaX
    }

    const containerWidth = this.base.parentNode.offsetWidth
    // TODO: use the correct 0-52 weeks
    const start = clamp(Math.round(map(left, 0, containerWidth, 0, 48)), 0, 48)
    const end = clamp(Math.round(map(left + width, 0, containerWidth, 0, 48)), 0, 48)

    if (start >= end) return
    if (end <= start) return

    this.applyResize({ start, end })
    this.refs.dragged.range = [start, end]
  }

  handleMouseUp (e) {
    if (!this.refs || !this.refs.dragged) return
    this.state.isResizing.set(false)

    const range = this.refs.dragged.range
    delete this.refs.dragged

    if (!range) return

    this.state.data.update(data => {
      if (!data.timeline) data.timeline = {}
      data.timeline.start = range[0]
      data.timeline.end = range[1]
      return data
    }, true)
  }

  handleDelete () {
    this.state.data.update(data => ({ ...data, deleted: true }), true)
  }

  beforeDestroy () {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('mouseleave', this.handleMouseUp)
  }
}
