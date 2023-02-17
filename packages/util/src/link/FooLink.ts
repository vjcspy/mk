import type { Observable as RxObservable } from 'rxjs';

export namespace FooLink {
  export type Observable = RxObservable<any>;
  export type Operation = {};
}

export class FooLink {
  handle = (
    operation: FooLink.Operation,
    forward: () => FooLink.Observable,
  ): FooLink.Observable | void => {
    // eslint-disable-next-line no-console
    console.log('default handle');
    return forward();
  };

  constructor(
    handle?: (
      operation: FooLink.Operation,
      forward: () => FooLink.Observable,
    ) => FooLink.Observable | void,
  ) {
    if (typeof handle === 'function') this.handle = handle;
  }
}
