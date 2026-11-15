import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import api from '../api';

export default function useKill(featureKey = null) {
  const { killState, setKillState } = useStore();

  const syncKillStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/kill/status');
      if (data && typeof data === 'object') {
        setKillState({
          globalKill: Boolean(data.globalKill),
          features: data.features || {},
          isHidden: Boolean(data.isHidden),
        });
      }
    } catch {
      // Fail silently to preserve existing state on transient network glitch
    }
  }, [setKillState]);

  useEffect(() => {
    syncKillStatus();
  }, [syncKillStatus]);

  const isKilled = featureKey ? Boolean(killState.features?.[featureKey]) : false;

  return {
    globalKill: Boolean(killState.globalKill),
    isHidden: Boolean(killState.isHidden),
    isKilled,
    refreshKillStatus: syncKillStatus,
  };
}
