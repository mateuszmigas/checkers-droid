interface ReadableStream<R = never> {
  [Symbol.asyncIterator](): AsyncIterableIterator<R>;
}

