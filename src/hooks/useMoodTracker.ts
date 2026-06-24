import { useState, useEffect, useCallback, useRef } from 'react';
import * as moodsApi from '../api/moods';

type MoodMap = Record<string, string>;
type CheckInMap = Record<string, boolean>;

export function useMoodTracker() {
  const [moods, setMoods] = useState<MoodMap>({});
  const [checkIns, setCheckIns] = useState<CheckInMap>({});
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    moodsApi.getMoods(0, 0)
      .then((entries) => {
        const moodMap: MoodMap = {};
        const checkInMap: CheckInMap = {};
        for (const entry of entries) {
          if (entry.emoji) {
            moodMap[entry.date] = entry.emoji;
          }
          if (entry.checkedIn) {
            checkInMap[entry.date] = true;
          }
        }
        setMoods(moodMap);
        setCheckIns(checkInMap);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setMood = useCallback(
    (date: string, emoji: string) => {
      setMoods((prev) => {
        const next = { ...prev };
        if (emoji) {
          next[date] = emoji;
        } else {
          delete next[date];
        }
        return next;
      });

      moodsApi.upsertMood(date, emoji || null).catch(() => {});
    },
    [],
  );

  const getMood = useCallback(
    (date: string): string | undefined => moods[date],
    [moods],
  );

  const checkIn = useCallback(
    (date: string, value = true) => {
      setCheckIns((prev) => {
        const next = { ...prev };
        if (value) {
          next[date] = true;
        } else {
          delete next[date];
        }
        return next;
      });

      moodsApi.upsertMood(date, undefined, value).catch(() => {});
    },
    [],
  );

  const isChecked = useCallback(
    (date: string): boolean => date in checkIns,
    [checkIns],
  );

  return { moods, checkIns, loading, setMood, getMood, checkIn, isChecked };
}
