import React from 'react';
import { Popover, Button, Whisper, Row } from 'rsuite';
import '../popover.less';
import { getServerUrl } from '../../../utils/server.js';

const DB_VERSION = 1;

const DB_NAME = "audiobook-server";
navigator.storage.persist()

var dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

dbRequest.onerror = event => {
  console.error(event)
  // Handle errors.
};

var audiobookStore = null;

dbRequest.onupgradeneeded = event => {
  const db = event.target.result;

  // Create an objectStore to hold information about our customers. We're
  // going to use "ssn" as our key path because it's guaranteed to be
  // unique - or at least that's what I was told during the kickoff meeting.
  db.createObjectStore("audiobooks", { keyPath: "filename" });
};


function download(video){

  const base_url = getServerUrl();
  fetch(base_url + '/book/download?filename='+video)
    .then(response => response.arrayBuffer())
    .then(data => {
      audiobookStore = dbRequest.result.transaction("audiobooks", "readwrite").objectStore("audiobooks");
      audiobookStore.add({filename: video, data});
    });
}

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
            <Button className="popover-button" onClick={()=>{download(video)}}>Download to Player</Button>
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
