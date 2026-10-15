import { describe, it, expect, beforeEach } from 'vitest';
import { StreamProcessor } from './StreamProcessor';
import type { A2UIMessage } from '../schema/a2ui-envelope';

describe('StreamProcessor', () => {
  let messages: A2UIMessage[];
  let errors: Error[];
  let processor: StreamProcessor;

  beforeEach(() => {
    messages = [];
    errors = [];
    processor = new StreamProcessor({
      onMessage: (msg) => messages.push(msg),
      onError: (err) => errors.push(err),
    });
  });

  describe('processJSON', () => {
    it('processes a valid A2UI message', () => {
      processor.processJSON({ createSurface: { surfaceId: 's1' } });
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({ createSurface: { surfaceId: 's1' } });
    });

    it('processes an array of messages', () => {
      processor.processJSON([
        { createSurface: { surfaceId: 's1' } },
        { updateDataModel: { surfaceId: 's1', path: '/x', value: 1 } },
      ]);
      expect(messages).toHaveLength(2);
    });

    it('reports error for invalid messages', () => {
      processor.processJSON({ notAValidMessage: true });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Invalid A2UI message');
    });

    it('handles nested arrays', () => {
      processor.processJSON([[{ createSurface: { surfaceId: 's1' } }]]);
      expect(messages).toHaveLength(1);
    });
  });

  describe('processJSONL', () => {
    it('processes JSONL with multiple lines', () => {
      const jsonl = [
        '{"createSurface": {"surfaceId": "s1"}}',
        '{"updateDataModel": {"surfaceId": "s1", "path": "/x", "value": 42}}',
        '',
        '{"updateComponents": {"surfaceId": "s1", "components": [{"id": "c1", "component": "Code", "code": "hi"}]}}',
      ].join('\n');

      processor.processJSONL(jsonl);
      expect(messages).toHaveLength(3);
    });

    it('skips empty lines', () => {
      processor.processJSONL('\n\n\n');
      expect(messages).toHaveLength(0);
      expect(errors).toHaveLength(0);
    });

    it('reports parse errors for malformed JSON', () => {
      processor.processJSONL('not json\n{"createSurface": {"surfaceId": "s1"}}');
      expect(errors).toHaveLength(1);
      expect(messages).toHaveLength(1);
    });
  });

  describe('batching', () => {
    it('batches messages within the window', async () => {
      const batchedMessages: A2UIMessage[] = [];
      const batchProcessor = new StreamProcessor({
        onMessage: (msg) => batchedMessages.push(msg),
        batchWindow: 50,
      });

      batchProcessor.processJSON({ createSurface: { surfaceId: 's1' } });
      batchProcessor.processJSON({ createSurface: { surfaceId: 's2' } });

      // Messages not delivered yet
      expect(batchedMessages).toHaveLength(0);

      // Wait for batch window
      await new Promise((r) => setTimeout(r, 80));
      expect(batchedMessages).toHaveLength(2);
    });

    it('flush delivers immediately', () => {
      const batchedMessages: A2UIMessage[] = [];
      const batchProcessor = new StreamProcessor({
        onMessage: (msg) => batchedMessages.push(msg),
        batchWindow: 1000,
      });

      batchProcessor.processJSON({ createSurface: { surfaceId: 's1' } });
      expect(batchedMessages).toHaveLength(0);

      batchProcessor.flush();
      expect(batchedMessages).toHaveLength(1);
    });
  });

  describe('destroy', () => {
    it('flushes pending messages on destroy', () => {
      const batchedMessages: A2UIMessage[] = [];
      const batchProcessor = new StreamProcessor({
        onMessage: (msg) => batchedMessages.push(msg),
        batchWindow: 1000,
      });

      batchProcessor.processJSON({ createSurface: { surfaceId: 's1' } });
      batchProcessor.destroy();
      expect(batchedMessages).toHaveLength(1);
    });
  });
});
