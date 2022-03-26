import Store from 'store'
import { render } from 'utils/jsx'
import ReconnectingWebSocket from 'reconnectingwebsocket'
import App from 'components/App'

/// #if DEVELOPMENT
require('webpack-hot-middleware/client?reload=true')
/// #endif

let websocket
render(<App />, document.body)

Store.dirty.subscribe(dirty => {
  if (!dirty || !websocket) return
  const payload = JSON.stringify({
    columns: Store.columns.get(),
    colors: Store.colors.get(),
    items: Store.items.current
      .filter(Boolean)
      .map(item => {
        delete item.index
        return item
      })
      .sort((a, b) => a.index - b.index)
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
    const { items, colors, columns } = JSON.parse(data)
    Store.columns.set(columns)
    Store.colors.set(colors)
    Store.items.set(items.map((item, index) => Object.assign(item, { index })))
    Store.dirty.set(false)
  }
})

Store.filter.subscribe(names => {
  if (names.length) window.location.hash = '#' + names.join(',')
  else window.history.pushState('', document.title, window.location.pathname + window.location.search)
})
