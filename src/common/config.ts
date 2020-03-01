export default interface IConfig {
  get<T>(key: string): T;
}
