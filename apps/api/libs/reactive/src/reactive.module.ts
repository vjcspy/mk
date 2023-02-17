import {
  getStateManager,
  StateManager,
} from '@lib/reactive/provider/StateManager';
import { dummyAction } from '@lib/reactive/store/actions';
import { DUMMY_EFFECTS } from '@lib/reactive/store/effects';
import { DummyAEffect } from '@lib/reactive/store/effects/dummy/DummyAEffect';
import { DummyBEffect } from '@lib/reactive/store/effects/dummy/DummyBEffect';
import { DummyCEffect } from '@lib/reactive/store/effects/dummy/DummyCEffect';
import { Module } from '@nestjs/common';

@Module({
  providers: [StateManager, ...DUMMY_EFFECTS],
  exports: [],
})
export class ReactiveModule {
  constructor(
    private stateManager: StateManager,
    private dummyAEffect: DummyAEffect,
    private dummyBEffect: DummyBEffect,
    private dummyCEffect: DummyCEffect,
  ) {
    this.stateManager.addFeatureEffect('dummyA', dummyAEffect);
    this.stateManager.addFeatureEffect('dummyB', dummyBEffect);
    this.stateManager.addFeatureEffect('dummyC', dummyCEffect);
  }

  onModuleInit() {
    getStateManager().dispatch(dummyAction());
  }
}
