import { Observable } from 'rxjs';

import { FooLink } from './FooLink';

// Đỉnh cao luôn =))

const bar1Link = new FooLink((operation, forward) => {
  console.log('bar1Link handle');
  // eslint-disable-next-line no-param-reassign
  operation['bar1Link'] = +new Date();

  return forward();
});

const bar2Link = new FooLink((operation, forward) => {
  console.log('bar2Link handle');
  // eslint-disable-next-line no-param-reassign
  operation['bar2Link'] = +new Date();

  // Chính là observable được tạo ra ở bar3Link
  const ob = forward();

  return new Observable((subscriber) => {
    console.log('bar2Link process');
    ob.subscribe((value) => {
      console.log('got value in bar2Link', value);
      subscriber.next(value);
    });
  });
});

const bar3Link = new FooLink((operation) => {
  console.log('bar3Link handle');
  // eslint-disable-next-line no-param-reassign
  operation['bar3Link'] = +new Date();

  return new Observable((subscriber) => {
    console.log('bar3Link process');
    subscriber.next('value from bar3');
    subscriber.complete();
  });
});

function processLink(links: FooLink[]) {
  let i = 0;
  const operation = {};
  let observable: FooLink.Observable = new Observable<any>((subscriber) => {
    subscriber.next('default value');
  });
  const handleLink = () => {
    if (i < links.length) {
      const newObservable = links[i].handle(operation, () => {
        i += 1;
        return handleLink();
      });
      if (newObservable) {
        observable = newObservable;
      }
    }

    return observable;
  };

  const result = handleLink();
  console.log('operation', operation);

  result.subscribe(console.log);
}
/*
 * Có quan tâm đến thứ tự, link cuối cùng sẽ là link terminated(tức không gọi forward)
 * */
processLink([bar1Link, bar2Link, bar3Link]);
