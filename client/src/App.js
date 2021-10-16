import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

function App() {
  return (
    <div className="App">
      <AudioPlayer
          autoPlay
          showSkipControls
          progressJumpSteps={{backward:30000, forward:30000}}
          src="http://localhost:3001/book?filename=book.m4a"
          onPlay={e => console.log("onPlay")}
          // other props here
        />
    </div>
  );
}

export default App;
