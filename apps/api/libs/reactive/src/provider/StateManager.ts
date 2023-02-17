import { createStoreManager } from '@lib/reactive/util/store/createStoreManager';
import { EFFECT_PROPERTY_KEY } from '@lib/reactive/util/store/effectDecorator';
import { Injectable, Scope } from '@nestjs/common';
import { configureStore, createReducer } from '@reduxjs/toolkit';
import type { List } from 'immutable';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  scope: Scope.DEFAULT,
})
export class StateManager {
  private static storeManager = createStoreManager(
    {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      empty: createReducer({}, () => {}),
    },
    [],
    [],
  );

  private static storeInstance = configureStore({
    reducer: StateManager.storeManager.reduce,
    middleware: [...StateManager.storeManager.middleware()],
    devTools: false,
  });

  constructor() {
    StateManager.getStoreManager().runEpic();
  }

  public static getStoreManager() {
    return StateManager.storeManager;
  }

  public static getStore() {
    return StateManager.storeInstance;
  }

  addFeatureEffect(featureName: string, ...effectObjects: any[]) {
    const effects = [];
    effectObjects.forEach((effectObject) => {
      const propertyEffectMetadata: List<string> = Reflect.getMetadata(
        EFFECT_PROPERTY_KEY,
        effectObject,
      );
      if (propertyEffectMetadata) {
        propertyEffectMetadata.forEach((effectProperty) => {
          if (typeof effectObject[effectProperty] === 'function') {
            effects.push(effectObject[effectProperty]);
          }
        });
      }
    });

    StateManager.getStoreManager().addEpics(featureName, effects);

    return this;
  }
}

export const getStateManager = () => ({
  dispatch: (action: any) => {
    if (!('meta' in action)) {
      // eslint-disable-next-line no-param-reassign
      action['meta'] = {
        chainId: uuidv4(),
        chain: action.type,
      };
    }
    StateManager.getStore().dispatch(action);
  },
  store: StateManager.getStore(),
});
