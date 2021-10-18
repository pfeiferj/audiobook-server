import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from 'react-h5-audio-player';
import get from 'lodash/get';
import 'react-h5-audio-player/lib/styles.css';
import { useParams } from 'react-router-dom';

async function updatePosition(filename,position,positionId,setPositionId){
    const data = {
      filename,
      position,
      updates: positionId
    }
    const response = await axios.post('http://localhost:3001/book/position', data);
    if(!positionId) {
      setPositionId(response.data.id);
    }
}

export default function Book() {
  const [metadata, setMetadata] = useState({});
  const [positionId, setPositionId] = useState(0);

  const { book } = useParams();
  const player = useRef()

  useEffect(() => {
    axios.get('http://localhost:3001/book/metadata?filename=' + book)
      .then(response => setMetadata(response.data))
      .catch(e => console.error(e));


  }, [book]);

  useEffect(() => {
    axios.get('http://localhost:3001/book/position?filename=' + book)
      .then(response => {
        if(response.data.length) {
          player.current.audio.current.currentTime = response.data[0].position;
        }
        player.current.audio.current.play()
      })
      .catch(e => console.error(e));
  }, [book, player]);

  async function onListen(event) {
    updatePosition(book, event.target.currentTime, positionId, setPositionId);
  }
  function onPause(event) {
    updatePosition(book, event.target.currentTime, positionId, setPositionId);
    setPositionId(0);
  }


  document.title = get(metadata, "format.tags.title", "Audiobook");

  return (
    <div className="Book">
      <img alt="Book cover art" src={"http://localhost:3001/book/cover?filename="+book} />
      <AudioPlayer
          showSkipControls
          progressJumpSteps={{backward:30000, forward:30000}}
          src={"http://localhost:3001/book?filename=" + book}
          onPause={onPause}
          ref={player}
          listenInterval={5000}
          onListen={onListen}
        />
    </div>
  );
}
