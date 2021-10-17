import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AudioPlayer from 'react-h5-audio-player';
import get from 'lodash/get';
import 'react-h5-audio-player/lib/styles.css';
import { useParams } from 'react-router-dom';

export default function Book() {
  const [metadata, setMetadata] = useState({});

  const { book } = useParams();

  useEffect(() => {
    let mounted = true;
    axios.get('http://localhost:3001/book/metadata?filename=' + book)
      .then(response => setMetadata(response.data))
      .catch(e => console.error(e));
    return () => mounted = false;
  }, []);


  document.title = get(metadata, "format.tags.title", "Audiobook");

  return (
    <div className="Book">
      <img alt="Book cover art" src={"http://localhost:3001/book/cover?filename="+book} />
      <AudioPlayer
          autoPlay
          showSkipControls
          progressJumpSteps={{backward:30000, forward:30000}}
          src={"http://localhost:3001/book?filename=" + book}
          onPlay={e => console.log("onPlay")}
          // other props here
        />
    </div>
  );
}
