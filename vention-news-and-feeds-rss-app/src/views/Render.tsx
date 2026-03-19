/// <reference types="vite/client" />

import { useEffect } from 'react'
import { NewsFeedsContainer } from '../components/render/NewsFeedsContainer/NewsFeedsContainer'
import { ArticleRotator } from '../components/render/ArticleRotator/ArticleRotator'
import { EmptyState } from '../components/render/EmptyState/EmptyState'
import {
  useUiScaleStoreState,
  useSelectedFeedsStoreState,
  useArticleDurationStoreState,
  useRefreshIntervalStoreState,
  useTransitionStyleStoreState,
  useCachedArticlesStoreState,
  useRssFeedsStoreState,
  useIsOfflineStoreState,
} from '../hooks/store'
import type { AppConfig } from '../types'
import './Render.css'

/**
 * Render - Entry point for the news feeds render view
 * 
 * Kept thin and declarative per cursor rules.
 * Main logic and UI scaling handled by NewsFeedsContainer.
 * Subscribes to instance storage to react instantly when operators modify selections.
 */
export function Render() {
  const [, uiScale] = useUiScaleStoreState()
  const [isLoadingSelected, selectedFeeds] = useSelectedFeedsStoreState()
  const [isLoadingDuration, articleDurationSec] = useArticleDurationStoreState()
  const [isLoadingInterval, refreshIntervalMin] = useRefreshIntervalStoreState()
  const [isLoadingTransition, transitionStyle] = useTransitionStyleStoreState()
  const [isLoadingCachedArticles, cachedArticles] = useCachedArticlesStoreState()
  const [isLoadingFeeds, feeds] = useRssFeedsStoreState()
  const [isLoadingOffline, isOffline] = useIsOfflineStoreState()

  // Build config from instance storage - automatically subscribes to changes
  const config: AppConfig = {
    selectedFeeds,
    articleDurationSec,
    refreshIntervalMin,
    transitionStyle,
  }

  const isLoading = isLoadingSelected || isLoadingDuration || isLoadingInterval || isLoadingTransition || isLoadingCachedArticles || isLoadingFeeds || isLoadingOffline

  // Start feed polling worker if in development mode
  useEffect(() => {
    const simulateWorker = import.meta.env.MODE === 'development'
    if (simulateWorker) {
      // Dynamically import and start the worker
      // @ts-expect-error - Dynamic import of JS worker file
      import('../../workers/pollFeeds.js').catch((error) => {
        console.error('Failed to load feed polling worker:', error)
      })
    }
  }, [])

  // Offline status is determined solely by worker: true only when all feed requests fail

  // Show empty state if no feeds selected
  if (!isLoadingSelected && selectedFeeds.length === 0) {
    return (
      <NewsFeedsContainer uiScale={uiScale} config={config} isLoading={isLoading}>
        <EmptyState />
      </NewsFeedsContainer>
    )
  }

  // Show article rotator with cached articles
  return (
    <NewsFeedsContainer uiScale={uiScale} config={config} isLoading={isLoading}>
      <ArticleRotator
        articles={cachedArticles || []}
        feeds={feeds || []}
        durationSec={articleDurationSec}
        transitionStyle={transitionStyle}
        isOffline={isOffline}
      />
    </NewsFeedsContainer>
  )
}
