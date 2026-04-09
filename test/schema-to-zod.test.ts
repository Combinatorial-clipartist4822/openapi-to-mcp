import { describe, expect, it } from 'vitest';

import { jsonSchemaToZod } from '../src/schema-to-zod.js';

describe('jsonSchemaToZod', () => {
  it('converts string schema', () => {
    const schema = jsonSchemaToZod({ type: 'string' });
    expect(schema.safeParse('hello').success).toBe(true);
    expect(schema.safeParse(123).success).toBe(false);
  });

  it('converts integer schema with constraints', () => {
    const schema = jsonSchemaToZod({
      type: 'integer',
      minimum: 1,
      maximum: 10,
    });
    expect(schema.safeParse(5).success).toBe(true);
    expect(schema.safeParse(1.5).success).toBe(false);
    expect(schema.safeParse(0).success).toBe(false);
    expect(schema.safeParse(11).success).toBe(false);
  });

  it('converts number schema', () => {
    const schema = jsonSchemaToZod({ type: 'number' });
    expect(schema.safeParse(3.14).success).toBe(true);
    expect(schema.safeParse('nope').success).toBe(false);
  });

  it('converts boolean schema', () => {
    const schema = jsonSchemaToZod({ type: 'boolean' });
    expect(schema.safeParse(true).success).toBe(true);
    expect(schema.safeParse('true').success).toBe(false);
  });

  it('converts enum schema', () => {
    const schema = jsonSchemaToZod({ type: 'string', enum: ['a', 'b', 'c'] });
    expect(schema.safeParse('a').success).toBe(true);
    expect(schema.safeParse('d').success).toBe(false);
  });

  it('converts array schema', () => {
    const schema = jsonSchemaToZod({
      type: 'array',
      items: { type: 'string' },
    });
    expect(schema.safeParse(['a', 'b']).success).toBe(true);
    expect(schema.safeParse([1, 2]).success).toBe(false);
    expect(schema.safeParse('not-array').success).toBe(false);
  });

  it('converts object schema with required and optional fields', () => {
    const schema = jsonSchemaToZod({
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
      },
    });
    expect(schema.safeParse({ name: 'hello' }).success).toBe(true);
    expect(schema.safeParse({ name: 'World', age: 30 }).success).toBe(true);
    expect(schema.safeParse({}).success).toBe(false);
  });

  it('converts nullable schema', () => {
    const schema = jsonSchemaToZod({ type: 'string', nullable: true });
    expect(schema.safeParse('hello').success).toBe(true);
    expect(schema.safeParse(null).success).toBe(true);
  });

  it('merges allOf schemas', () => {
    const schema = jsonSchemaToZod({
      allOf: [
        {
          type: 'object',
          properties: { a: { type: 'string' } },
          required: ['a'],
        },
        { type: 'object', properties: { b: { type: 'number' } } },
      ],
    });
    expect(schema.safeParse({ a: 'hi', b: 1 }).success).toBe(true);
    expect(schema.safeParse({ b: 1 }).success).toBe(false);
  });

  it('returns z.unknown() for $ref (unresolved)', () => {
    const schema = jsonSchemaToZod({ $ref: '#/components/schemas/Foo' });
    expect(schema.safeParse('anything').success).toBe(true);
    expect(schema.safeParse(42).success).toBe(true);
  });
});
