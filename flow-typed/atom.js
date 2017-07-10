/* @flow */

declare var atom: any

declare module 'atom' {
  declare type TextEditor = any;
  declare type TextBuffer = any;

  declare type Point = {
    row: number,
    column: number,
  };

  declare type Range = {
    start: Point,
    end: Point,
  };

  declare type BufferMarker = {
    previousEventState: {
      range: Range
    }
  }

  declare type DisplayMarker = {
    bufferMarker: BufferMarker,
    destroy(): void
  };
}
