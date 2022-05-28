import { Injectable } from '@nestjs/common';
import { exec as nodeExec } from 'child_process';
import { promisify } from 'util';
const exec = promisify(nodeExec);

@Injectable()
export class FfmpegService {
  async getAudioCodec(path: string) {
    const { stdout } = await exec(
      `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 '${path}'`,
    );
    const codec = stdout.replace(/[\r\n]/g, '');
    return codec;
  }

  async getCoverArt(path: string) {
    const { stdout } = await exec(
      `ffmpeg -i '${path}' -map 0:v -map -0:V -f mjpeg -hide_banner -loglevel quiet -`,
      { encoding: 'binary' },
    );
    const file = Buffer.from(stdout, 'binary');
    return file;
  }

  async getMetadata(path: string) {
    const { stdout } = await exec(
      `ffprobe -i '${path}' -print_format json -show_chapters -show_format -loglevel quiet`,
    );
    const metadata = JSON.parse(stdout);
    return metadata;
  }
}
