import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from 'react-h5-audio-player';
import get from 'lodash/get';
import 'react-h5-audio-player/lib/styles.css';
import { useParams } from 'react-router-dom';
import { Panel } from 'rsuite';
import Download from './elements/download/Download.jsx';
import Positions from './elements/positions/Positions.jsx';
import Chapters from './elements/chapters/Chapters.jsx';
import queryString from 'query-string';
import './book.less';
import { getServerUrl } from '../utils/server.js';
import {updatePosition} from '../utils/db.js';

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
  const base_url = getServerUrl();

  useEffect(() => {
    axios.get(base_url.origin + '/book/metadata?'+queryString.stringify({filename:book}))
      .then(response => setMetadata(response.data))
      .catch(e => console.error(e));


  }, [book]);

  useEffect(() => {
    axios.get(base_url.origin + '/book/position?'+queryString.stringify({filename:book}))
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

  function onSelectedPosition(position) {
    setPositionId(position.id);
    player.current.audio.current.currentTime = position.position;
  }

  function onSelectedChapter(chapter) {
    setPositionId(0);
    player.current.audio.current.currentTime = parseFloat(chapter.start_time);
  }

  function onNext() {
    const position = player.current.audio.current.currentTime;
    for(let i = 0; i < metadata.chapters.length; i++) {
      const chapterTime = parseFloat(metadata.chapters[i].start_time);
      if(position < chapterTime) {
        setPositionId(0);
        player.current.audio.current.currentTime = chapterTime;
        break;
      }
    }
  }

  function onPrevious() {
    const position = player.current.audio.current.currentTime;
    const bufferedPosition = position - 30; //trying to sync to skip back time, should use a const.
    for(let i = metadata.chapters.length - 1; i >= 0; i--) {
      const chapterTime = parseFloat(metadata.chapters[i].start_time);
      if(bufferedPosition > chapterTime) {
        setPositionId(0);
        player.current.audio.current.currentTime = chapterTime;
        break;
      }
    }
  }

  const hasChapters = metadata && metadata.chapters;
  function getCurrentChapter() {
    if(!hasChapters || !player) {
      return (<span></span>);
    }
    const position = player.current.audio.current.currentTime;
    for(let i = 0; i < metadata.chapters.length; i++) {
      const chapterStartTime = parseFloat(metadata.chapters[i].start_time);
      const chapterEndTime = parseFloat(metadata.chapters[i].end_time);
      if(position > chapterStartTime && position < chapterEndTime) {
        return (<span className="right-spacer">{metadata.chapters[i].tags.title}</span>);
      }
    }
    return (<span></span>);
  }


  document.title = get(metadata, "format.tags.title", "Audiobook");
  global.meta = metadata;

  const additionalControls = [
    (
      <nobr className="controls-width-fix">
        {getCurrentChapter()}
        <Download video={book} />
        <Positions positionSelected={onSelectedPosition} positions={positions} />
        <Chapters chapterSelected={onSelectedChapter} chapters={metadata.chapters} />
      </nobr>
    )
  ];

  return (
    <div className="Book">
      <center><img alt="Book cover art" src={base_url.origin + "/book/cover?"+queryString.stringify({filename:book})}/></center>
      <AudioPlayer
          showSkipControls={hasChapters && metadata.chapters.length > 1}
          progressJumpSteps={{backward:30000, forward:30000}}
          src={base_url.origin + "/book?"+queryString.stringify({filename:book})}
          onPause={onPause}
          ref={player}
          listenInterval={5000}
          onListen={onListen}
          onClickPrevious={onPrevious}
          onClickNext={onNext}
          customAdditionalControls={additionalControls}
        />
      <div className="Metadata">
        {renderMetadata(metadata)}
      </div>
    </div>
  );
}
