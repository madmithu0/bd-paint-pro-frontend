import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import api from '../api';

export default function useKill(featureKey = null) {
  const store = useStore ? useStore() : {};
  const { killState, setKillState } = store;

  const [localState, setLocalState] = useState({
    features: {},
    govtFeatureFlags: {
      autoVatEnabled: false,
      nbrBinMandateEnabled: false,
      govtAuditEnabled: false,
    },
    hotlineConfig: {
      number: '',
      isLive: false,
    },
    isHidden: false,
  });

  const syncKillStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/kill/public-status');
      if (data && typeof data === 'object') {
        const nextState = {
          features: data.featureSwitches || data.features || {},
          govtFeatureFlags: {
            autoVatEnabled: Boolean(data.govtFeatureFlags?.autoVatEnabled),
            nbrBinMandateEnabled: Boolean(data.govtFeatureFlags?.nbrBinMandateEnabled),
            govtAuditEnabled: Boolean(data.govtFeatureFlags?.govtAuditEnabled),
          },
          hotlineConfig: {
            number: data.hotlineConfig?.number || '',
            isLive: Boolean(data.hotlineConfig?.isLive),
          },
          isHidden: Boolean(data.isHidden),
        };

        setLocalState(nextState);
        if (typeof setKillState === 'function') {
          setKillState(nextState);
        }
      }
    } catch {
      // Preserve existing state on transient network glitch
    }
  }, [setKillState]);

  useEffect(() => {
    syncKillStatus();
  }, [syncKillStatus]);

  const activeFeatures = killState?.features || localState.features;
  const activeGovtFlags = killState?.govtFeatureFlags || localState.govtFeatureFlags;
  const activeHotline = killState?.hotlineConfig || localState.hotlineConfig;
  const normalizedKey = featureKey ? String(featureKey).toUpperCase() : null;

  const isKilled = normalizedKey ? Boolean(activeFeatures?.[normalizedKey]) : false;

  return {
    isHidden: Boolean(killState?.isHidden ?? localState.isHidden),
    isKilled,
    featureSwitches: activeFeatures,
    govtFeatureFlags: activeGovtFlags,
    hotlineConfig: activeHotline,
    refreshKillStatus: syncKillStatus,
  };
}
