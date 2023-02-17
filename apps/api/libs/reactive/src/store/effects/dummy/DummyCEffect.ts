import { dummyB, dummyC } from '@lib/reactive/store/actions';
import { createEffectX } from '@lib/reactive/util/store/createEffect';
import { Effect } from '@lib/reactive/util/store/effectDecorator';
import { Injectable, Logger } from '@nestjs/common';
import { map, pipe } from 'rxjs';

@Injectable()
export class DummyCEffect {
  private readonly logger = new Logger(DummyCEffect.name);

  @Effect()
  processC = createEffectX('processC', dummyB.AFTER, () =>
    pipe(
      map(() => {
        this.logger.log('processing dummy C');
        return dummyC.AFTER();
      }),
    ),
  );
}
