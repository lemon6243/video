export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function downloadVideoFrame(videoElement: HTMLVideoElement, title: string = 'video-frame'): void {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 1280;
    canvas.height = videoElement.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-frame-${Math.floor(videoElement.currentTime)}s.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Failed to capture frame (possible CORS restriction on external video):', err);
  }
}
