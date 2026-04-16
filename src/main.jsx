import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// import ComponentsPreview from './ComponentsPreview'

// Dashboard integrado con todos los componentes nuevos
// Para ver el preview de componentes, descomentar ComponentsPreview y comentar App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)