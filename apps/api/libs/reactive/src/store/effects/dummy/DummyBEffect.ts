import { dummyA, dummyB } from '@lib/reactive/store/actions';
import { createEffectX } from '@lib/reactive/util/store/createEffect';
import { Effect } from '@lib/reactive/util/store/effectDecorator';
import { Injectable, Logger } from '@nestjs/common';
import { map, pipe } from 'rxjs';

@Injectable()
export class DummyBEffect {
  private readonly logger = new Logger(DummyBEffect.name);

  @Effect()
  processB = createEffectX('processB', dummyA.AFTER, () =>
    pipe(
      map(() => {
        this.logger.log('processing dummy B');
        return dummyB.AFTER();
      }),
    ),
  );
}
