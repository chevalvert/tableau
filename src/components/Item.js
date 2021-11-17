import Store from 'store'
import { Component } from 'utils/jsx'
import { writable } from 'utils/state'
import classnames from 'classnames'
import Button from 'components/Button'
import Icon from 'components/Icon'

import noop from 'utils/noop'

export default class Item extends Component {
  beforeRender (props) {
    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleColorChange = this.handleColorChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleDelete = this.handleDelete.bind(this)

    this.state = {
      sortable: props.sortable === undefined ? true : props.sortable,
      deletable: props.deletable === undefined ? true : props.deletable,
      colorable: props.colorable === undefined ? true : props.colorable,

      column: writable(props.column),
      colors: writable(props.colors || [])
    }
  }

  template (props, state) {
    return (
      <li
        id={props.id}
        class={classnames('item', props.class)}
      >
        {state.sortable && <Icon name='bars' class='item__handle' />}
        <div
          contentEditable
          placeholder={props.placeholder}
          class='item__name'
          ref={this.ref('content')}
          event-keydown={this.handleKeydown}
          event-blur={this.handleBlur}
        >
          {props.name}
        </div>
        {state.colorable && (
          <div class='item__colors'>
            {
              Array.from(new Set([
                ...Store.colors.get(),
                ...state.colors.get()
              ])).map(color => (
                <input
                  type='checkbox'
                  style={`--color: ${color}`}
                  checked={state.colors.current.includes(color)}
                  event-change={this.handleColorChange(color)}
                />
              ))
            }
          </div>
        )}
        {state.deletable && <Button icon='trash' class='button--trash' event-click={this.handleDelete} />}
      </li>
    )
  }

  get DOMIndex () {
    return [...this.base.parentNode.children].indexOf(this.base)
  }

  toJson () {
    return {
      name: this.refs.content.textContent,
      column: this.state.column.get(),
      colors: this.state.colors.get()
    }
  }

  // This is called by the parent component
  handleSort (e) {
    this.state.column.set(this.base.parentNode.dataset('index'))
  }

  handleKeydown (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.refs.content.blur()
    }
    ;(this.props['event-keydown'] || noop)(this)
  }

  handleColorChange (color) {
    return e => {
      this.state.colors.update(colors => {
        if (e.target.checked) colors.push(color)
        else colors.splice(colors.indexOf(color), 1)

        return Array.from(new Set([...colors]))
      }, true)

      ;(this.props['event-color'] || noop)(this)
    }
  }

  handleBlur () {
    this.refs.content.scrollLeft = 0
    ;(this.props['event-blur'] || noop)(this)
  }

  handleDelete () {
    const callback = this.props['event-delete'] || noop
    this.destroy()
    callback()
  }
}
