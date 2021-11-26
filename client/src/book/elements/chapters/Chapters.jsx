import React from 'react';
import { Popover, Button, Whisper, Row } from 'rsuite';
import '../popover.less';

function onClick(selectedCallback, position) {
  return () => {
    if(selectedCallback) {
      selectedCallback(position);
    }
  }
}

function formatPositionTime(time){
  let totalSeconds = Math.floor(time);
  let seconds = totalSeconds % 60;
  if(seconds < 10) {
    seconds = '0' + seconds;
  }
  let totalMinutes = Math.floor(totalSeconds / 60);
  let minutes = totalMinutes % 60;
  if(minutes < 10) {
    minutes = '0' + minutes;
  }
  let hours = Math.floor(totalMinutes / 60);
  if(hours < 10) {
    hours = '0' + hours;
  }
  return `${hours}:${minutes}:${seconds}`;
}


export default function Chapters(props) {
  const { chapters, chapterSelected } = props;
  if(!(chapters && chapters.length)) {
    return (<></>)
  }

  function renderChapter(chapter){
    const text = chapter.tags.title !== undefined
      ? chapter.tags.title
      : formatPositionTime(parseFloat(chapter.start_time))
    return (
      <Row className="popover-row">
        <Button onClick={onClick(chapterSelected, chapter)} className="popover-button">{ text }</Button>
      </Row>
    )
  }

  return (
    <Whisper
      trigger="click"
      placement="top"
      speaker={(
        <Popover className="popover-height">
          {chapters && chapters.map(renderChapter)}
        </Popover>
      )}
    >
      <Button>Chapters</Button>
    </Whisper>
  );
}
