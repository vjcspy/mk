import { ofType } from '@lib/reactive/util/store/ofType';
import { Logger } from '@nestjs/common';
import type { PayloadActionCreator } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import type { StateObservable } from 'redux-observable';
import type { Observable, OperatorFunction } from 'rxjs';
import { EMPTY, map } from 'rxjs';
import { filter } from 'rxjs/operators';

type AllowedType = string | PayloadActionCreator<any>;

const logger = new Logger('ReactiveEffect');

export const createEffectX = (
  effectName: string,
  allowedTypes: Array<AllowedType> | AllowedType,
  effect: (
    state?: any,
  ) => OperatorFunction<
    { type: string } | Observable<never>,
    { type: string } | Observable<never>
  >,
) => {
  return (
    action$: Observable<{ type: string }>,
    state$: StateObservable<any>,
  ): Observable<{ type: string } | Observable<never>> => {
    if (!Array.isArray(allowedTypes)) {
      // eslint-disable-next-line no-param-reassign
      allowedTypes = [allowedTypes];
    }
    let meta: any;
    return action$.pipe(
      ofType(...allowedTypes),
      map((a) => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-redeclare,no-param-reassign
        const action = _.clone(a);
        // eslint-disable-next-line no-param-reassign
        // @ts-ignore
        if ('meta' in action && 'chain' in action.meta) {
          // @ts-ignore
          // eslint-disable-next-line no-param-reassign
          action.meta.chain += `|${effectName}Effect`;

          // @ts-ignore
          meta = { ...action.meta };
        } else {
          meta = undefined;
        }
        logger.log({
          message: `Start effect: ${effectName}"`,
          eMeta: meta,
          // action,
        });

        return action;
      }),
      effect(state$.value),
      filter((action) => {
        if (meta) {
          // eslint-disable-next-line no-param-reassign
          action['meta'] = meta;
        }
        return action !== EMPTY;
      }),
    );
  };
};
