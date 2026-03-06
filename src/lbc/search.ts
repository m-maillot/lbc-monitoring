import { HEADERS } from './constants';
import { getLocationByCode, getLocationByName } from './location';
import {
  Location,
  OWNER_TYPE,
  Result,
  Search,
  SearchFilters,
  SearchResult,
  SimilarResult,
  SORT_BY,
  SORT_ORDER,
} from './types';

export async function search<T>(search_filters_input: Search): Promise<SearchResult<T>> {
  const res = await fetch('https://api.leboncoin.fr/finder/search', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(_makeFilters(search_filters_input)),
  });

  if (res.status !== 200) {
    console.log('Request failed: ', await res.text());
    throw new Error(`Erreur lors de la recherche : ${res.status}`);
  }
  const json = (await res.json()) as SearchResult<T>;
  return json;
}

// Paginate over all pages using max_pages returned by the API.
// It uses offset pagination and keeps the initial pivot to ensure stable results across pages.
export async function searchAll<T>(
  search_filters_input: Search,
  options?: { maxPages?: number }
): Promise<SearchResult<T>> {
  const limit = search_filters_input.limit || 30;
  const offset = search_filters_input.offset || 0;

  // First page
  const first = await search<T>({ ...search_filters_input, offset: offset, limit: limit });
  const ads: Result<T>[] = [...(first.ads || [])];

  const maxPagesFromApi = Math.max(1, first.max_pages || 1);
  const maxPages = options?.maxPages ? Math.min(options.maxPages, maxPagesFromApi) : maxPagesFromApi;

  // Keep the pivot returned by the first page (if any)
  // const pivot = first.pivot;

  // Iterate remaining pages (2..maxPages)
  for (let page = 2; page <= maxPages; page++) {
    const offset = (page - 1) * limit;
    const next = await search<T>({ ...search_filters_input, offset });
    if (Array.isArray(next.ads) && next.ads.length > 0) {
      ads.push(...next.ads);
    } else {
      // No more results
      break;
    }
  }

  // Return a merged SearchResult, relying on first-page totals/metadata
  return {
    total: first.total,
    total_all: first.total_all,
    total_pro: first.total_pro,
    total_private: first.total_private,
    max_pages: first.max_pages,
    referrer_id: first.referrer_id,
    human_readable_applied_condition: first.human_readable_applied_condition,
    pivot: first.pivot,
    ads,
  } as SearchResult<T>;
}

export async function searchById(list_id: number): Promise<Result<undefined> | undefined> {
  const search = await fetch(`https://api.leboncoin.fr/api/adfinder/v1/myads`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ ids: [list_id] }),
  });

  const json = (await search.json()) as Result<undefined>[];
  return json.length > 0 ? json[0] : undefined;
}

export async function similar<T>(id: number, limit = 10): Promise<Result<T>[]> {
  const similar = await fetch(`https://api.leboncoin.fr/api/same/v4/search/${id}?size=${limit}`, {
    headers: HEADERS,
  });

  const json = (await similar.json()) as SimilarResult;
  return json.ads as Result<T>[];
}

export function _makeFilters(search_filters_input: Search): SearchFilters {
  const search_filters: SearchFilters = {
    filters: {
      category: undefined,
      enums: _makeFiltersEnums(search_filters_input),
      keywords: undefined,
      ranges: _makeFiltersRanges(search_filters_input),
      location: {
        locations: [],
        shippable: true,
      },
    },
    limit: search_filters_input.limit || 30,
    offset: search_filters_input.offset || undefined,
    pivot: search_filters_input.pivot || undefined,
    owner_type: search_filters_input.owner_type || OWNER_TYPE.ALL,
    sort_by: search_filters_input.sort_by || SORT_BY.TIME,
    sort_order: search_filters_input.sort_order || SORT_ORDER.DESC,
  };

  if (search_filters_input.keywords !== undefined) {
    search_filters.filters.keywords = {
      text: search_filters_input.keywords,
      type: search_filters_input?.only_title === true ? 'subject' : 'all',
    };
  }

  if (search_filters_input.category !== undefined) {
    search_filters.filters.category = { id: search_filters_input.category };
  }

  if (search_filters_input.locations !== undefined) {
    search_filters.filters.location.locations = _makeFiltersLocations(search_filters_input);
    search_filters.filters.location.shippable = search_filters_input.shippable ?? false;
  } else {
    search_filters.filters.location.shippable = search_filters_input.shippable ?? true;
  }

  return search_filters;
}

export function _makeFiltersEnums(search_filters_input: Search) {
  const enums = search_filters_input.enums || {};

  if (enums.ad_type === undefined) {
    enums.ad_type = ['offer'];
  }

  return enums;
}

export function _makeFiltersRanges(search_filters_input: Search) {
  const ranges = search_filters_input.ranges || {};

  if (
    search_filters_input.price_min !== undefined ||
    search_filters_input.price_max !== undefined
  ) {
    ranges.price = {};
    ranges.price.min = search_filters_input.price_min ? search_filters_input.price_min : undefined;
    ranges.price.max = search_filters_input.price_max ? search_filters_input.price_max : undefined;
  }

  return ranges;
}

export function _makeFiltersLocations(search_filters_input: Search) {
  const locations: Location[] = [];

  search_filters_input.locations?.forEach((location) => {
    if (typeof location === 'string' && location.match(/[a-z]/i)) {
      const locationInfo = getLocationByName(location);
      if (locationInfo) {
        locations.push(locationInfo);
      }
    } else {
      const locationInfo = getLocationByCode(location);
      locations.push(locationInfo);
    }
  });

  return locations;
}
