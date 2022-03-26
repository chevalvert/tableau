import Store from 'store'
import { Component } from 'utils/jsx'
import classnames from 'classnames'
import cuid from 'cuid'
import noop from 'utils/noop'

import Icon from 'components/Icon'

export default class Colors extends Component {
  beforeRender () {
    this.handleEdit = this.handleEdit.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
  }

  template (props) {
    return (
      <section class='colors'>
        {
          Object.entries(Store.colors.get() || {}).map(([hex, name]) => {
            const id = cuid()
            const selected = name && Store.filter.current && Store.filter.current.includes(name.toLowerCase())
            return (
              <form
                class={classnames('color', { 'is-filtered': selected })}
                style={`--color: black; --background: ${hex}`}
                event-submit={this.handleEdit(hex)}
              >
                <input
                  type='text'
                  value={name}
                  class={classnames({ 'is-filtered': selected })}
                  event-blur={this.handleEdit(hex)}
                />
                {name && [
                  <input
                    id={id}
                    type='checkbox'
                    checked={selected}
                    event-change={this.handlePreview(name)}
                  />,
                  <label for={id}>
                    <Icon name='preview' class='icon--preview' />
                    <Icon name='hidden' class='icon--hidden' />
                  </label>
                ]}
              </form>
            )
          })
        }
      </section>
    )
  }

  handleEdit (hex) {
    return e => {
      e.preventDefault()
      const input = e.target.tagName === 'FORM'
        ? e.target.querySelector('input[type=text]')
        : e.target
      if (!input || !input.value) return

      Store.colors.update(colors => {
        colors[hex] = input.value
        return colors
      }, true)
      Store.dirty.set(true)
    }
  }

  handlePreview (name) {
    if (!name) return noop
    name = name.toLowerCase()
    return e => {
      Store.filter.update((names = []) => {
        if (e.target.checked) names.push(name)
        else names.splice(names.indexOf(name), 1)
        return Array.from(new Set([...names]))
      }, true)
    }
  }
}
