import { exec as nodeExec } from 'child_process';
import util from 'util';

const exec = util.promisify(nodeExec);

export async function getAudioCodec(path) {
  const { stdout } = await exec(`ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${path}"`)
  const codec = stdout.replace(/[\r\n]/g, "");
  return codec;
}

export async function getCoverArt(path) {
  const { stdout } = await exec(`ffmpeg -i "${path}" -map 0:v -map -0:V -f mjpeg -hide_banner -loglevel quiet -`, { encoding: "binary" })
  const file = Buffer.from(stdout, "binary")
  return file;
}

export async function getMetadata(path) {
  const { stdout } = await exec(`ffprobe -i "${path}" -print_format json -show_chapters -show_format -loglevel quiet`)
  const metadata = JSON.parse(stdout);
  return metadata;
}
