export interface ISeenAdsStore {
  hasBeenSeen(adId: number): Promise<boolean>;
  markAsSeen(adId: number): Promise<void>;
}
