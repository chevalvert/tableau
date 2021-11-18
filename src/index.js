import Store from 'store'
import { render } from 'utils/jsx'
import ReconnectingWebSocket from 'reconnectingwebsocket'
import App from 'components/App'

/// #if DEVELOPMENT
require('webpack-hot-middleware/client?reload=true')
/// #endif

// TODO: implement https://github.com/automerge/automerge

let websocket
const app = render(<App />, document.body).components[0]

Store.dirty.subscribe(dirty => {
  if (!dirty || !websocket) return
  const payload = JSON.stringify({
    colors: app.colors,
    items: app.items
  })
  websocket.send(payload)
})

Store.authenticated.subscribe(authenticated => {
  if (!authenticated) return

  websocket = new ReconnectingWebSocket([
    window.location.protocol === 'https:' ? 'wss:' : 'ws:',
    window.location.host
  ].join('//'))
  websocket.onopen = () => websocket.send('')

  // The remote server is the single source of truth
  websocket.onmessage = ({ data }) => {
    const { items, colors } = JSON.parse(data)
    Store.colors.set(colors)
    Store.items.set(items)
    Store.dirty.set(false)
  }
})
