import { dummyA, dummyAction, dummyAfter } from '@lib/reactive/store/actions';
import { createEffectX } from '@lib/reactive/util/store/createEffect';
import { Effect } from '@lib/reactive/util/store/effectDecorator';
import { Injectable, Logger } from '@nestjs/common';
import { map, pipe } from 'rxjs';

@Injectable()
export class DummyAEffect {
  private readonly logger = new Logger(DummyAEffect.name);

  @Effect()
  process = createEffectX('process', dummyAction, () =>
    pipe(
      map(() => {
        this.logger.log({
          message: 'processing dummy',
          anotherMeta: 'hello',
        });
        return dummyAfter();
      }),
    ),
  );

  @Effect()
  processA = createEffectX('processA', dummyAfter, () =>
    pipe(
      map(() => {
        this.logger.log('processing dummy A');
        return dummyA.AFTER();
      }),
    ),
  );

  @Effect()
  processA1 = createEffectX('processA1', dummyAfter, () =>
    pipe(
      map(() => {
        this.logger.log('processA1 dummy A');
        return dummyA.ERROR();
      }),
    ),
  );
}
