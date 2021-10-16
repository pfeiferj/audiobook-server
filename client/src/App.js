import React, { useState, useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import axios from 'axios';
import get from 'lodash/get';

function App() {
  const [metadata, setMetadata] = useState({});
  useEffect(async () => {
    try {
      const response = await axios.get('http://localhost:3001/book/metadata?filename=book.m4a');
      setMetadata(response.data);
    } catch(e) {
      console.error(e);
    }
  });
  document.title = get(metadata, "format.tags.title", "Audiobook");
  return (
    <div className="App">
      <img src="http://localhost:3001/book/cover?filename=book.m4a" />
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
