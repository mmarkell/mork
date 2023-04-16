export abstract class Engine {
  public abstract prompt(message: string): Promise<string>;
}
