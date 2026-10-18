// import { useState } from 'react';
// import type { PageResponse, ResourceFilter, ResourceResponse } from '../api/types/resource.ts';
//
// /**
//  * TODO(student): Load a page of resources (resourceApi.findAll) for the
//  * ResourcesPage, re-fetching whenever the filter or page changes, with
//  * loading/error state, a delete action (resourceApi.delete) and an analyze
//  * action (resourceApi.analyze). Mirror the searchRunsProvider pattern.
//  */

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {
  PageResponse,
  ResourceFilter,
  ResourceResponse
} from '../api/types/resource.ts';
import resourceApi from '../api/resourceApi.ts';

/**
 * Loads resources when autoLoad is enabled.
 * Resource cards can use the same hook for actions without loading another page.
 */
const useResources = (
    filter: ResourceFilter,
    page: number,
    size: number,
    autoLoad = true
) => {
  // Keep the filter reference stable when its values have not changed.
  const filterKey = JSON.stringify(filter);
  const stableFilter = useMemo(
      () => JSON.parse(filterKey) as ResourceFilter,
      [filterKey]
  );

  const [resources, setResources] =
      useState<PageResponse<ResourceResponse> | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await resourceApi.findAll(
          stableFilter,
          page,
          size
      );

      setResources(response.data);
    } catch (err) {
      console.error('Failed to load resources:', err);
      setError('Failed to load resources.');
      setResources(null);
    } finally {
      setLoading(false);
    }
  }, [stableFilter, page, size]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void loadResources();

    const handleResourcesChanged = () => {
      void loadResources();
    };

    window.addEventListener(
        'resources-changed',
        handleResourcesChanged
    );

    return () => {
      window.removeEventListener(
          'resources-changed',
          handleResourcesChanged
      );
    };
  }, [loadResources, autoLoad]);

  const onDelete = async (id: number) => {
    try {
      await resourceApi.delete(id.toString());

      if (autoLoad) {
        await loadResources();
      } else {
        window.dispatchEvent(new Event('resources-changed'));
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
      setError('Failed to delete resource.');
    }
  };

  const onAnalyze = async (id: number) => {
    try {
      await resourceApi.analyze(id.toString());

      if (autoLoad) {
        await loadResources();
      } else {
        window.dispatchEvent(new Event('resources-changed'));
      }
    } catch (err) {
      console.error('Failed to analyze resource:', err);
      setError('Failed to analyze resource.');
    }
  };

  return {
    resources,
    loading,
    error,
    onDelete,
    onAnalyze
  };
};

export default useResources;