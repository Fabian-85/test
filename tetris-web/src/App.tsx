import Tetris from './components/Tetris'
import './index.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>NEON TETRIS</h1>
      </header>
      <main>
        <Tetris />
      </main>
      <footer>
        <p>Built with React & Canvas</p>
      </footer>
    </div>
  )
}

export default App
