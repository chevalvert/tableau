import Store from 'store'
import { Component } from 'utils/jsx'
import { writable } from 'utils/state'

export default class Login extends Component {
  beforeRender () {
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      error: writable(null)
    }
  }

  template () {
    return (
      <section class='login' store-class-has-error={this.state.error}>
        <form event-submit={this.handleSubmit}>
          <div class='login__message'>Authentification requise</div>
          <input autofocus type='password' ref={this.ref('password')} />
          <div class='login__error' store-text={this.state.error} />
        </form>
      </section>
    )
  }

  async afterMount () {
    // Try a passwordless login in case a session cookie exists
    const response = await window.fetch('/login', { method: 'POST' })
    if (response.ok) Store.authenticated.set(true)
  }

  async handleSubmit (e) {
    e.preventDefault()
    const response = await window.fetch('/login', {
      method: 'POST',
      headers: {
        Authorization: 'Basic' + window.btoa(this.refs.password.value)
      }
    })

    if (!response.ok) {
      const json = await response.json()
      this.state.error.set(json.error || 'Erreur inconnue')
      return
    }

    Store.authenticated.set(true)
  }
}
