import React from 'react';
import { Popover, Button, Whisper, Row } from 'rsuite';

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

export default function Positions(props) {
  const { positions, positionSelected } = props;

  return (
    <Whisper
      trigger="click"
      placement="top"
      speaker={(
        <Popover style={{maxHeight:'300px', overflow:'auto'}}>
          {positions && positions.map(position => (
            <Row style={{marginRight: '-11px'}}>
              <Button onClick={onClick(positionSelected, position)} style={{width:'100%'}}>{ formatPositionTime(position.position) }</Button>
            </Row>
          ))}
        </Popover>
      )}
    >
      <Button>Positions</Button>
    </Whisper>
  );
}
