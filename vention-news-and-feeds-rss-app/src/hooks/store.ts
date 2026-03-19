import { createUseInstanceStoreState } from '@telemetryos/sdk/react'
import type { Article, RssFeed } from '../types'
import type { TransitionStyle } from '../types'
import { DEFAULT_CONFIG } from '../types'

export const useUiScaleStoreState = createUseInstanceStoreState<number>('ui-scale', 1)

export const useRssFeedsStoreState = createUseInstanceStoreState<RssFeed[]>('rssFeeds', [])

export const useSelectedFeedsStoreState = createUseInstanceStoreState<string[]>('selectedFeeds', DEFAULT_CONFIG.selectedFeeds)

export const useCachedArticlesStoreState = createUseInstanceStoreState<Article[]>('cachedArticles', [])

export const useArticleDurationStoreState = createUseInstanceStoreState<number>('articleDurationSec', DEFAULT_CONFIG.articleDurationSec)

export const useRefreshIntervalStoreState = createUseInstanceStoreState<number>('refreshIntervalMin', DEFAULT_CONFIG.refreshIntervalMin)

export const useTransitionStyleStoreState = createUseInstanceStoreState<TransitionStyle>('transitionStyle', DEFAULT_CONFIG.transitionStyle)

export const useIsOfflineStoreState = createUseInstanceStoreState<boolean>('isOffline', false)

export const useLastUpdatedAtStoreState = createUseInstanceStoreState<number>('lastUpdatedAt', 0)
