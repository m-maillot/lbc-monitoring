import { Advertisement } from '../entities/Advertisement';

export interface ILogger {
  info(message: string): void;
  error(message: string): void;
  logNewAdvertisements(searchName: string, ads: Advertisement[]): void;
  logNoNewAdvertisements(searchName: string): void;
}
