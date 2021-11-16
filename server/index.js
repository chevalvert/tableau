#!/usr/bin/env node

const fs = require('fs-extra')
const http = require('http')
const path = require('path')
const express = require('express')
const session = require('express-session')
const dotenv = require('dotenv')
const WebSocket = require('ws')

const ENV_FILE = path.resolve(__dirname, '.env')
dotenv.config({ path: ENV_FILE })

const DATA_FILE = path.resolve(__dirname, process.env.DATA_FILE)
fs.ensureFileSync(DATA_FILE)

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ noServer: true })

const sessionParser = session({
  saveUninitialized: true,
  secret: process.env.PASSWORD,
  resave: false,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000
  }
})

// Middlewares
app.use((req, res, next) => { console.log(new Date(), req.originalUrl); next() })
app.use(express.static(path.join(__dirname, '..', 'build')))
app.use(express.static(path.join(__dirname, '..', 'static')))
app.use(sessionParser)
app.use((err, req, res, next) => {
  console.error(new Date(), err)
  res.status(500).json({ error: err.message })
})

// Webpack and HMR in dev
if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')

  const config = require('../config/webpack.config.dev.js')
  const compiler = webpack(config)

  app.use(require('webpack-dev-middleware')(compiler, {
    serverSideRender: true,
    publicPath: config.output.publicPath
  }))

  app.use(require('webpack-hot-middleware')(compiler))
}

// Websocket
wss.on('connection', ws => {
  ws.on('message', async message => {
    const data = message.toString()
    const items = data
      ? JSON.parse(data)
      : await fs.readJson(DATA_FILE)

    await fs.writeJson(DATA_FILE, items, { spaces: 2 })
    for (const client of wss.clients) {
      client.send(JSON.stringify(items))
    }
  })
})

// Client authentication
app.post('/login', (req, res, next) => {
  const hash = 'Basic' + Buffer.from(process.env.PASSWORD).toString('base64')

  // Check if session is already authed, or check for password
  if (req.session.authenticated || req.get('Authorization') === hash) {
    req.session.authenticated = true
    return res.sendStatus(200)
  }

  res.status(403).send({ error: 'Mot de passe incorrect' })
})

// Websocket authentication handling
server.on('upgrade', (request, socket, head) => {
  sessionParser(request, {}, () => {
    if (!request.session.authenticated) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit('connection', ws, request)
    })
  })
})

//
app.get('/', (req, res) => {

  console.log({ authenticated: req.session.authenticated })
})

// Server startup
server.listen(process.env.HTTP_PORT, () => {
  console.log(new Date(), `Server is up and running on port ${process.env.HTTP_PORT}`)
})
