import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ObjectStorageService } from './objectStorage';

describe('ObjectStorageService.normalizeObjectEntityPath', () => {
  it('converts Google Storage URLs into /objects/{id}', () => {
    process.env.PRIVATE_OBJECT_DIR = '/bucket/private';
    const service = new ObjectStorageService();
    const url = 'https://storage.googleapis.com/bucket/private/abc123';
    const result = service.normalizeObjectEntityPath(url);
    assert.strictEqual(result, '/objects/abc123');
  });

  it('returns original path when URL does not match expected prefix', () => {
    process.env.PRIVATE_OBJECT_DIR = '/bucket/private';
    const service = new ObjectStorageService();
    const url = 'https://example.com/bucket/private/abc123';
    const result = service.normalizeObjectEntityPath(url);
    assert.strictEqual(result, url);
  });

  it('handles paths outside the private object directory', () => {
    process.env.PRIVATE_OBJECT_DIR = '/bucket/private';
    const service = new ObjectStorageService();
    const url = 'https://storage.googleapis.com/bucket/public/abc123';
    const result = service.normalizeObjectEntityPath(url);
    assert.strictEqual(result, '/bucket/public/abc123');
  });
});
