import React from 'react'
import { createRoot } from 'react-dom/client'
import './main.sass'
import App from './App'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement!)
renderRoot()

function renderRoot () {
  root.render(
    <App/>
  )
}

