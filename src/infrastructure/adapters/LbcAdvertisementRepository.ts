import {IAdvertisementRepository} from '../../domain/ports/IAdvertisementRepository';
import {Advertisement} from '../../domain/entities/Advertisement';
import {SearchConfiguration} from '../../domain/entities/SearchConfiguration';
import {search, SORT_BY, SORT_ORDER, Result} from '../../lbc';
import {calculateDistance} from '../../domain/utils/distanceCalculator';

export class LbcAdvertisementRepository implements IAdvertisementRepository {
    async search(config: SearchConfiguration): Promise<Advertisement[]> {
        const searchResult = await search({
            keywords: config.keywords,
            only_title: config.onlyTitle,
            shippable: config.shippable,
            locations: config.locations,
            category: config.category,
            owner_type: config.ownerType as any,
            price_min: config.priceMin,
            price_max: config.priceMax,
            enums: config.enums,
            ranges: config.ranges,
            sort_by: SORT_BY.TIME,
            sort_order: SORT_ORDER.DESC,
            limit: 100,
        });

        const ads = searchResult.ads.map((ad: Result<any>) => this.mapToAdvertisement(ad, config));

        // Sort by distance if buyer location is provided
        if (config.buyerLocation) {
            ads.sort((a, b) => {
                const distA = a.distanceKm ?? Number.MAX_VALUE;
                const distB = b.distanceKm ?? Number.MAX_VALUE;
                return distA - distB;
            });
        }

        return ads;
    }

    private mapToAdvertisement(ad: Result<any>, config: SearchConfiguration): Advertisement {
        let distanceKm: number | undefined;

        // Calculate distance if buyer location is provided and ad has coordinates
        if (config.buyerLocation && ad.location?.lat && ad.location?.lng) {
            distanceKm = calculateDistance(
                config.buyerLocation.lat,
                config.buyerLocation.lng,
                ad.location.lat,
                ad.location.lng
            );
        }

        return {
            id: ad.list_id,
            title: ad.subject,
            description: ad.body,
            price: ad.price_cents / 100,
            url: ad.url,
            imageUrl: ad.images?.urls?.[0] || ad.images?.urls_large?.[0] || '',
            publicationDate: new Date(ad.first_publication_date),
            location: ad.location?.city_label || '',
            category: ad.category_name,
            distanceKm,
        };
    }
}
