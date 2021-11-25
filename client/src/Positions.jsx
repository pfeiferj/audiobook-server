import React, { useState } from 'react';
import { Popover, Button, Whisper } from 'rsuite';

export default function Positions(props) {
  const { positions, positionSelected } = props;
  const [visible, setVisible] = useState(false)

  return (
    <Whisper
      trigger="click"
      placement="top"
      speaker={(
        <Popover visible={visible}>
          {positions && positions.map(position => (
            <Row>
              { position.position }
            </Row>
          ))}
        </Popover>
      )}
    >
      <Button>Positions</Button>
    </Whisper>
  );
}
