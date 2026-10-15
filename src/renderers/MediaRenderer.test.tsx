import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MediaRenderer from './MediaRenderer';

describe('MediaRenderer', () => {
  it('renders an image', () => {
    const { container } = render(
      <MediaRenderer
        component={{
          id: 'img1',
          component: 'Media',
          mediaType: 'image',
          src: 'https://example.com/photo.jpg',
          alt: 'Test photo',
          title: 'My Photo',
        }}
        data={undefined}
      />
    );

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('https://example.com/photo.jpg');
    expect(img!.getAttribute('alt')).toBe('Test photo');
  });

  it('renders a video with controls', () => {
    const { container } = render(
      <MediaRenderer
        component={{
          id: 'vid1',
          component: 'Media',
          mediaType: 'video',
          src: 'https://example.com/video.mp4',
          controls: true,
        }}
        data={undefined}
      />
    );

    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video!.getAttribute('src')).toBe('https://example.com/video.mp4');
  });

  it('renders an audio element', () => {
    const { container } = render(
      <MediaRenderer
        component={{
          id: 'aud1',
          component: 'Media',
          mediaType: 'audio',
          src: 'https://example.com/track.mp3',
        }}
        data={undefined}
      />
    );

    const audio = container.querySelector('audio');
    expect(audio).toBeTruthy();
  });

  it('renders a caption when provided', () => {
    render(
      <MediaRenderer
        component={{
          id: 'img2',
          component: 'Media',
          mediaType: 'image',
          src: 'https://example.com/photo.jpg',
          caption: 'A beautiful sunset',
        }}
        data={undefined}
      />
    );

    expect(screen.getByText('A beautiful sunset')).toBeTruthy();
  });
});
