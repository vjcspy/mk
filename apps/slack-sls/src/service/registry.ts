export class Registry {
  private static data: Record<string, any> = {};

  static registry(key: string): any {
    return Registry.data[key];
  }

  static register(key: string, value: any): any {
    Registry.data[key] = value;

    return Registry;
  }
}
