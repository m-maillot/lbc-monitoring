import { Advertisement } from '../entities/Advertisement';

export interface IEmailNotifier {
  sendNewAdvertisements(searchName: string, ads: Advertisement[]): Promise<void>;
}
