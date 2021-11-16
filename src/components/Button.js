import { Component } from 'utils/jsx'
import { writable } from 'utils/state'
import classnames from 'classnames'
import noop from 'utils/noop'

import Icon from 'components/Icon'

export default class Button extends Component {
  beforeRender (props) {
    this.handleClick = this.handleClick.bind(this)

    this.state = {
      isWaiting: writable(false),
      isDisabled: props['store-disabled'] || writable(props.disabled)
    }
  }

  template (props) {
    return (
      <button
        class={classnames('button', props.class)}
        store-class-is-waiting={this.state.isWaiting}
        store-class-is-disabled={this.state.isDisabled}
        event-click={this.handleClick}
        event-mouseenter={props['event-mouseenter'] || noop}
        event-mouseleave={props['event-mouseleave'] || noop}
        title={props.title}
        store-disabled={this.state.isDisabled}
      >
        {props.icon && (
          <span class='button__icon'>
            <Icon name={props.icon} />
            <Icon name='loader' class='button__icon--loading' />
          </span>
        )}
        {props.label && <span class='button__text'>{props.label}</span>}
      </button>
    )
  }

  async handleClick (e) {
    this.state.isWaiting.set(true)
    await (this.props['event-click'] || noop)(e)

    // Testing for mounted before doing anything, because the event-click may
    // cause this component to be destroyed
    if (!this.mounted) return
    this.state.isWaiting.set(false)
  }
}
