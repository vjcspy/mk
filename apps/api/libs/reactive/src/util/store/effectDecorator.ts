import 'reflect-metadata';

import { List } from 'immutable';

export const EFFECT_PROPERTY_KEY = Symbol('EFFECT_PROPERTY_KEY');

export function Effect() {
  // eslint-disable-next-line func-names
  return function (target: any, propertyName: string) {
    // property decorator for Effect Service
    let propertyEffectMetadata: List<string> = Reflect.getMetadata(
      EFFECT_PROPERTY_KEY,
      target,
    );

    if (!List.isList(propertyEffectMetadata)) {
      propertyEffectMetadata = List();
    }

    propertyEffectMetadata = propertyEffectMetadata.push(propertyName);

    Reflect.defineMetadata(EFFECT_PROPERTY_KEY, propertyEffectMetadata, target);
  };
}
