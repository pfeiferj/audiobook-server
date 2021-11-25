import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from 'react-h5-audio-player';
import get from 'lodash/get';
import 'react-h5-audio-player/lib/styles.css';
import { useParams } from 'react-router-dom';
import { Panel } from 'rsuite';
import Positions from './Positions.jsx';

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

function renderMetadata(metadata) {
  const tags = get(metadata, 'format.tags', {});

  return (
    <div className="metadata">
      <h2>{tags.title}</h2>
      <h3>Author: {tags.artist}</h3>
      <h3>Description:</h3> <p>{tags.comment}</p>
      <br/>
      <Panel header="All Tags" collapsible bordered>
        {Object.keys(tags).map(tag => (<div><h4>{tag}:</h4><p>{tags[tag]}</p></div>))}
      </Panel>
    </div>
  )
}

export default function Book() {
  const [metadata, setMetadata] = useState({});
  const [positionId, setPositionId] = useState(0);
  const [positions, setPositions] = useState([]);

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
          setPositions(response.data)
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

  function onSelected(position) {
    setPositionId(position.id);
    player.current.audio.current.currentTime = position.position;
  }


  document.title = get(metadata, "format.tags.title", "Audiobook");
  global.meta = metadata;

  return (
    <div className="Book">
      <img alt="Book cover art" src={"http://localhost:3001/book/cover?filename="+book} style={{"display": "block", "margin-left": "auto", "margin-right": "auto", "maxWidth": "50%"}}/>
      <AudioPlayer
          showSkipControls
          progressJumpSteps={{backward:30000, forward:30000}}
          src={"http://localhost:3001/book?filename=" + book}
          onPause={onPause}
          ref={player}
          listenInterval={5000}
          onListen={onListen}
          customAdditionalControls={[(<Positions positionSelected={onSelected} positions={positions} />)]}
        />
      <div className="Metadata">
        {renderMetadata(metadata)}
      </div>
    </div>
  );
}
