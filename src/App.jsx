import './App.css'
import CountDown from './CountDown'

function App() {
  return (
    <>
      <h1>Halo</h1>
      <div className="card">
        <CountDown minutes={2} />
      </div>
      <p className="read-the-docs">
        Live tiktok koding bareng
      </p>
    </>
  )
}

export default App
