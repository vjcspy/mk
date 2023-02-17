import { Registry } from '@/service/registry';

describe('Service Registry', () => {
  it('should return data when register', () => {
    Registry.register('key', 'value');
    expect(Registry.registry('key')).toEqual('value');
  });
});
