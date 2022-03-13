import React from 'react';
import { Popover, Button, Whisper, Row } from 'rsuite';
import { getServerUrl } from '../../../utils/server.js';
import { downloadBook } from '../../../utils/db.js';
import '../popover.less';

export default function Download(props) {
  const { video } = props;
  const base_url = getServerUrl();
  return (
    <Whisper
      trigger="click"
      placement="top"
      speaker={(
        <Popover className="popover-height">
          <Row className="popover-row">
            <Button className="popover-button" onClick={()=>{downloadBook(video)}}>Download to Player</Button>
          </Row>
          <Row className="popover-row">
            <a href={base_url + 'book/download?filename='+video} download><Button className="popover-button">Download to File</Button></a>
          </Row>
        </Popover>
      )}
    >
      <Button className="right-spacer">Download</Button>
    </Whisper>
  );
}
