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

export default function Positions(props) {
  const { positions, positionSelected } = props;

  return (
    <Whisper
      trigger="click"
      placement="top"
      speaker={(
        <Popover className="popover-height">
          {positions && positions.map(position => (
            <Row className="popover-row">
              <Button onClick={onClick(positionSelected, position)} className="popover-button">{ formatPositionTime(position.position) }</Button>
            </Row>
          ))}
        </Popover>
      )}
    >
      <Button className="right-spacer">Positions</Button>
    </Whisper>
  );
}
