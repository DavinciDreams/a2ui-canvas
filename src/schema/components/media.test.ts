import { describe, it, expect } from 'vitest';
import type { MediaComponent } from './media';

describe('MediaComponent', () => {
  it('creates a minimal media component', () => {
    const media: MediaComponent = {
      id: 'media1',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
    };

    expect(media.id).toBe('media1');
    expect(media.component).toBe('Media');
    expect(media.mediaType).toBe('image');
    expect(media.src).toBe('https://example.com/image.jpg');
  });

  it('creates a media component with video type', () => {
    const media: MediaComponent = {
      id: 'media2',
      component: 'Media',
      mediaType: 'video',
      src: 'https://example.com/video.mp4',
    };

    expect(media.mediaType).toBe('video');
  });

  it('creates a media component with audio type', () => {
    const media: MediaComponent = {
      id: 'media3',
      component: 'Media',
      mediaType: 'audio',
      src: 'https://example.com/audio.mp3',
    };

    expect(media.mediaType).toBe('audio');
  });

  it('creates a media component with alt text', () => {
    const media: MediaComponent = {
      id: 'media4',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      alt: 'A beautiful landscape',
    };

    expect(media.alt).toBe('A beautiful landscape');
  });

  it('creates a media component with caption', () => {
    const media: MediaComponent = {
      id: 'media5',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      caption: 'Sunset over the mountains',
    };

    expect(media.caption).toBe('Sunset over the mountains');
  });

  it('creates a media component with title', () => {
    const media: MediaComponent = {
      id: 'media6',
      component: 'Media',
      mediaType: 'video',
      src: 'https://example.com/video.mp4',
      title: 'Product Demo',
    };

    expect(media.title).toBe('Product Demo');
  });

  it('creates a media component with controls enabled', () => {
    const media: MediaComponent = {
      id: 'media7',
      component: 'Media',
      mediaType: 'video',
      src: 'https://example.com/video.mp4',
      controls: true,
    };

    expect(media.controls).toBe(true);
  });

  it('creates a media component with autoplay enabled', () => {
    const media: MediaComponent = {
      id: 'media8',
      component: 'Media',
      mediaType: 'video',
      src: 'https://example.com/video.mp4',
      autoplay: true,
    };

    expect(media.autoplay).toBe(true);
  });

  it('creates a media component with loop enabled', () => {
    const media: MediaComponent = {
      id: 'media9',
      component: 'Media',
      mediaType: 'video',
      src: 'https://example.com/video.mp4',
      loop: true,
    };

    expect(media.loop).toBe(true);
  });

  it('creates a media component with muted enabled', () => {
    const media: MediaComponent = {
      id: 'media10',
      component: 'Media',
      mediaType: 'video',
      src: 'https://example.com/video.mp4',
      muted: true,
    };

    expect(media.muted).toBe(true);
  });

  it('creates a media component with contain fit', () => {
    const media: MediaComponent = {
      id: 'media11',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'contain',
    };

    expect(media.fit).toBe('contain');
  });

  it('creates a media component with cover fit', () => {
    const media: MediaComponent = {
      id: 'media12',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'cover',
    };

    expect(media.fit).toBe('cover');
  });

  it('creates a media component with fill fit', () => {
    const media: MediaComponent = {
      id: 'media13',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'fill',
    };

    expect(media.fit).toBe('fill');
  });

  it('creates a media component with none fit', () => {
    const media: MediaComponent = {
      id: 'media14',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'none',
    };

    expect(media.fit).toBe('none');
  });

  it('creates a media component with scale-down fit', () => {
    const media: MediaComponent = {
      id: 'media15',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'scale-down',
    };

    expect(media.fit).toBe('scale-down');
  });

  it('creates a media component with numeric dimensions', () => {
    const media: MediaComponent = {
      id: 'media16',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      width: 800,
      height: 600,
    };

    expect(media.width).toBe(800);
    expect(media.height).toBe(600);
  });

  it('creates a media component with string dimensions', () => {
    const media: MediaComponent = {
      id: 'media17',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      width: '100%',
      height: '400px',
    };

    expect(media.width).toBe('100%');
    expect(media.height).toBe('400px');
  });

  it('creates a media component with all properties (video)', () => {
    const media: MediaComponent = {
      id: 'media18',
      component: 'Media',
      mediaType: 'video',
      src: 'https://example.com/video.mp4',
      alt: 'Product demonstration video',
      caption: 'Watch how our product works',
      title: 'Product Demo',
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      fit: 'contain',
      width: 800,
      height: 600,
    };

    expect(media.id).toBe('media18');
    expect(media.component).toBe('Media');
    expect(media.mediaType).toBe('video');
    expect(media.src).toBe('https://example.com/video.mp4');
    expect(media.alt).toBe('Product demonstration video');
    expect(media.caption).toBe('Watch how our product works');
    expect(media.title).toBe('Product Demo');
    expect(media.controls).toBe(true);
    expect(media.autoplay).toBe(false);
    expect(media.loop).toBe(false);
    expect(media.muted).toBe(false);
    expect(media.fit).toBe('contain');
    expect(media.width).toBe(800);
    expect(media.height).toBe(600);
  });

  it('creates a media component with all properties (audio)', () => {
    const media: MediaComponent = {
      id: 'media19',
      component: 'Media',
      mediaType: 'audio',
      src: 'https://example.com/audio.mp3',
      alt: 'Podcast episode',
      caption: 'Latest episode of our tech podcast',
      title: 'Tech Talk Episode 42',
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      width: '100%',
      height: '80px',
    };

    expect(media.id).toBe('media19');
    expect(media.component).toBe('Media');
    expect(media.mediaType).toBe('audio');
    expect(media.src).toBe('https://example.com/audio.mp3');
    expect(media.alt).toBe('Podcast episode');
    expect(media.caption).toBe('Latest episode of our tech podcast');
    expect(media.title).toBe('Tech Talk Episode 42');
    expect(media.controls).toBe(true);
    expect(media.autoplay).toBe(false);
    expect(media.loop).toBe(false);
    expect(media.muted).toBe(false);
    expect(media.width).toBe('100%');
    expect(media.height).toBe('80px');
  });

  it('creates a media component with all properties (image)', () => {
    const media: MediaComponent = {
      id: 'media20',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image.jpg',
      alt: 'Company logo',
      caption: 'Our official company logo',
      title: 'Company Logo',
      fit: 'scale-down',
      width: 300,
      height: 200,
    };

    expect(media.id).toBe('media20');
    expect(media.component).toBe('Media');
    expect(media.mediaType).toBe('image');
    expect(media.src).toBe('https://example.com/image.jpg');
    expect(media.alt).toBe('Company logo');
    expect(media.caption).toBe('Our official company logo');
    expect(media.title).toBe('Company Logo');
    expect(media.fit).toBe('scale-down');
    expect(media.width).toBe(300);
    expect(media.height).toBe(200);
  });

  it('handles special characters in src URL', () => {
    const media: MediaComponent = {
      id: 'media21',
      component: 'Media',
      mediaType: 'image',
      src: 'https://example.com/image with spaces.jpg?param=value&other=值',
      alt: 'Image with special characters',
    };

    expect(media.src).toBe('https://example.com/image with spaces.jpg?param=value&other=值');
    expect(media.alt).toBe('Image with special characters');
  });

  it('handles relative URLs', () => {
    const media: MediaComponent = {
      id: 'media22',
      component: 'Media',
      mediaType: 'image',
      src: '/images/local-image.png',
      alt: 'Local image',
    };

    expect(media.src).toBe('/images/local-image.png');
    expect(media.alt).toBe('Local image');
  });

  it('handles data URLs', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const media: MediaComponent = {
      id: 'media23',
      component: 'Media',
      mediaType: 'image',
      src: dataUrl,
      alt: 'Red square',
    };

    expect(media.src).toBe(dataUrl);
    expect(media.alt).toBe('Red square');
  });
});
