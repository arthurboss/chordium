import type { UseSearchCacheParams } from "../params.types";
import type { UseSearchCacheOperations } from "../operations.types";
import type { UseSearchCacheAction } from "../state/use-search-cache-state";
import { useCacheRetrieval } from "./cache-retrieval";
import { useCacheStorage } from "./cache-storage";
import { useCacheDeletion } from "./cache-deletion";
import { useStateManagement } from "./state-management";

/**
 * Composes all cache operations into unified interface
 */
export function useSearchCacheOperations(
  params: UseSearchCacheParams,
  dispatch: React.Dispatch<UseSearchCacheAction>
): UseSearchCacheOperations {
  const retrieval = useCacheRetrieval(params, dispatch);
  const storage = useCacheStorage(params, dispatch);
  const deletion = useCacheDeletion(params, dispatch);
  const stateManagement = useStateManagement(dispatch);

  return {
    ...retrieval,
    ...storage,
    ...deletion,
    ...stateManagement,
  };
}
