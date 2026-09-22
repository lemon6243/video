import { VideoItem } from '../types';

export const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    duration: 596,
    source: 'preset',
    description: 'A large, lovable rabbit deals with bullying forest creatures in this Blender Foundation classic open movie.',
    author: 'Blender Foundation',
    resolution: '1080p'
  },
  {
    id: 'sample-2',
    title: 'Tears of Steel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    duration: 734,
    source: 'preset',
    description: 'Sci-fi short film set in a dystopian future exploring visual effects, live action blending, and open source pipeline.',
    author: 'Blender Foundation / Ian Hubert',
    resolution: '1080p'
  },
  {
    id: 'sample-3',
    title: 'Elephants Dream',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    duration: 653,
    source: 'preset',
    description: 'Two men explore a giant, surreal machine world that reflects their psychological journey.',
    author: 'Orange Open Movie Project',
    resolution: '1080p'
  },
  {
    id: 'sample-4',
    title: 'Sintel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    duration: 888,
    source: 'preset',
    description: 'A lonely girl searches for a baby dragon she befriended and nursed back to health.',
    author: 'Durian Open Movie Project',
    resolution: '1080p'
  },
  {
    id: 'sample-5',
    title: 'For Bigger Blazes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    duration: 15,
    source: 'preset',
    description: 'High-energy cinematic teaser demonstration for mobile and cast playback.',
    author: 'Chromecast Samples',
    resolution: '720p'
  }
];
