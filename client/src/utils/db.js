import { getServerUrl } from './server.js';
import axios from 'axios';
import dexie from 'dexie';

const DB_VERSION = 1;
const DB_NAME = "audiobook-server";

const db = new dexie(DB_NAME);
db.version(DB_VERSION).stores({
  books: 'filename',
  positions: 'id++,filename'
});

navigator.storage.persist()

export async function downloadBook(video){
  const base_url = getServerUrl();
  const response = await fetch(base_url + 'book/download?filename='+video);
  const blob = await response.blob();

  
  db.books.put({filename: video, blob});
}

export async function updatePosition(filename,position,positionId,setPositionId){
  const data = {
    filename,
    position,
    updates: positionId
  }
  const base_url = getServerUrl();

  db.positions.put({id: positionId, filename, position, updatedAt: Date.now()})
  const positions = await db.positions.where({id: positionId}).toArray();
  console.log('positions', positions);

  const response = await axios.post(base_url.origin + '/book/position', data);
  if(!positionId) {
    setPositionId(response.data.id);
  }
}
