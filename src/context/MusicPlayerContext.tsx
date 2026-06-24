import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getSongUrls, getLyric } from '../api/music';
import type { LyricLine, MusicPlatform } from '../api/music';
import { getPlaylist as apiGetPlaylist, savePlaylist as apiSavePlaylist } from '../api/musicPlaylist';
import type { PlaylistEntry } from '../api/musicPlaylist';

// ============ Types ============

export interface Track {
  id: number | string;
  title: string;
  artist: string;
  src: string;
  fee: number;
  platform: MusicPlatform;
}

interface MusicPlayerContextType {
  // State
  isPlaying: boolean;
  trackIndex: number;
  progress: number;
  currentTime: number;
  duration: number;
  error: boolean;
  playlist: Track[];
  track: Track;

  // Lyrics
  lyrics: LyricLine[];
  lyricLoading: boolean;
  currentLyricIdx: number;

  // Controls
  togglePlay: () => void;
  prevTrack: () => void;
  nextTrack: () => void;
  playTrack: (idx: number) => void;
  addTrack: (t: Track) => void;
  removeTrack: (idx: number) => void;
  setPlaylist: (tracks: Track[]) => void;
  setPlaylistState: React.Dispatch<React.SetStateAction<Track[]>>;
  persistPlaylist: (tracks: Track[]) => void;
  saveCurrentPlaylist: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

// ============ Default tracks ============

const DEFAULT_TRACKS: Track[] = [
  {
    id: 0, title: 'Lofi Hip Hop', artist: 'Chill Beats',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', fee: 0, platform: 'ncm',
  },
  {
    id: 1, title: 'Jazz Piano', artist: 'Ambient Works',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', fee: 0, platform: 'ncm',
  },
  {
    id: 2, title: 'Electronic Vibes', artist: 'Synth Dreams',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', fee: 0, platform: 'ncm',
  },
];

// ============ Provider ============

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [playlist, setPlaylistState] = useState<Track[]>(DEFAULT_TRACKS);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedRef = useRef(false);

  const track = playlist[trackIndex] || DEFAULT_TRACKS[0];

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const audio = getAudio();
    setError(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    const setupAudio = (src: string) => {
      audio.src = src;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => setError(true));
      }
    };

    if (track.src) {
      setupAudio(track.src);
    } else if (track.id && track.id !== 0) {
      getSongUrls([track.id], track.platform).then((urls) => {
        const url = urls[0]?.url;
        if (url) {
          setPlaylistState((prev) => prev.map((t) => t.id === track.id ? { ...t, src: url } : t));
          setupAudio(url);
        } else {
          setError(true);
        }
      }).catch(() => setError(true));
    }

    const onEnded = () => {
      setProgress(0);
      setCurrentTime(0);
      setTrackIndex((i) => (i + 1) % playlist.length);
    };
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onErr = () => setError(true);

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('error', onErr);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('error', onErr);
    };
  }, [trackIndex, playlist]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const prevTrack = useCallback(() => {
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
    setTrackIndex((i) => (i - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const nextTrack = useCallback(() => {
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
    setTrackIndex((i) => (i + 1) % playlist.length);
  }, [playlist.length]);

  const playTrack = useCallback((idx: number) => {
    if (idx >= 0 && idx < playlist.length) {
      setProgress(0);
      setCurrentTime(0);
      setError(false);
      setIsPlaying(true);
      setTrackIndex(idx);
    }
  }, [playlist.length]);

  const addTrack = useCallback((t: Track) => {
    setPlaylistState((prev) => {
      const filtered = prev.filter((x) => x.id !== t.id);
      const next = [...filtered, t];
      // Auto-persist after add
      if (isLoggedIn) {
        apiSavePlaylist(next.map((x) => ({
          songId: x.id,
          title: x.title,
          artist: x.artist,
          fee: x.fee,
          platform: x.platform,
        }))).then(() => addToast('success', '已保存')).catch(() => {});
      }
      return next;
    });
  }, [isLoggedIn, addToast]);

  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  const removeTrack = useCallback((idx: number) => {
    setPlaylistState((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      if (isLoggedIn) {
        apiSavePlaylist(next.map((x) => ({
          songId: x.id, title: x.title, artist: x.artist, fee: x.fee, platform: x.platform,
        }))).catch(() => {});
      }
      return next;
    });
    setTrackIndex((cur) => {
      if (cur >= playlistRef.current.length - 1) return Math.max(0, playlistRef.current.length - 2);
      return cur;
    });
  }, [isLoggedIn]);

  const setPlaylist = useCallback((tracks: Track[]) => {
    setPlaylistState(tracks);
    setTrackIndex(0);
    setProgress(0);
    setCurrentTime(0);
    setError(false);
  }, []);

  const persistPlaylist = useCallback((tracks: Track[]) => {
    if (!isLoggedIn) {
      addToast('info', '登录后才能保存歌单');
      return;
    }
    apiSavePlaylist(tracks.map((t) => ({
      songId: t.id,
      title: t.title,
      artist: t.artist,
      fee: t.fee,
      platform: t.platform,
    }))).then(() => {
      addToast('success', '已保存');
    }).catch(() => {
      addToast('error', '保存失败');
    });
  }, [isLoggedIn, addToast]);

  // Convenience: persist the current playlist (reads from ref for latest state)
  const saveCurrentPlaylist = useCallback(() => {
    persistPlaylist(playlistRef.current);
  }, [persistPlaylist]);

  // Load playlist from API on mount
  useEffect(() => {
    if (!isLoggedIn || loadedRef.current) return;
    apiGetPlaylist().then(async (entries) => {
      loadedRef.current = true;
      if (entries.length === 0) return;
      const tracks: Track[] = entries.map((e: PlaylistEntry) => ({
        id: e.songId,
        title: e.title,
        artist: e.artist,
        src: '',
        fee: e.fee ?? 0,
        platform: (e.platform || 'ncm') as MusicPlatform,
      }));
      try {
        const ncmIds = entries.filter((e) => (e.platform || 'ncm') === 'ncm').map((e) => e.songId);
        const qqIds = entries.filter((e) => e.platform === 'qq').map((e) => e.songId);
        const kgIds = entries.filter((e) => e.platform === 'kugou').map((e) => e.songId);
        const allUrls = await Promise.all([
          ncmIds.length > 0 ? getSongUrls(ncmIds, 'ncm') : Promise.resolve([]),
          qqIds.length > 0 ? getSongUrls(qqIds, 'qq') : Promise.resolve([]),
          kgIds.length > 0 ? getSongUrls(kgIds, 'kugou') : Promise.resolve([]),
        ]);
        const urlMap = new Map<string, string>();
        allUrls.flat().forEach((u) => { if (u.url) urlMap.set(String(u.id), u.url); });
        tracks.forEach((t) => { if (urlMap.has(String(t.id))) t.src = urlMap.get(String(t.id))!; });
      } catch { /* URLs will be fetched on play */ }
      if (tracks.length > 0) setPlaylist(tracks);
    }).catch(() => { loadedRef.current = true; });
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lyrics
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricLoading, setLyricLoading] = useState(false);

  useEffect(() => {
    if (!track.id || track.id === 0) return;
    setLyrics([]);
    setLyricLoading(true);
    getLyric(track.id, track.platform)
      .then(setLyrics)
      .catch(() => setLyrics([]))
      .finally(() => setLyricLoading(false));
  }, [track.id, trackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentLyricIdx = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, currentTime]);

  // Cleanup (never truly unmounts at root level, but good practice)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const value = useMemo<MusicPlayerContextType>(() => ({
    isPlaying, trackIndex, progress, currentTime, duration, error, playlist, track,
    lyrics, lyricLoading, currentLyricIdx,
    togglePlay, prevTrack, nextTrack, playTrack, addTrack, removeTrack, setPlaylist,
    setPlaylistState, persistPlaylist, saveCurrentPlaylist,
  }), [
    isPlaying, trackIndex, progress, currentTime, duration, error, playlist, track,
    lyrics, lyricLoading, currentLyricIdx,
    togglePlay, prevTrack, nextTrack, playTrack, addTrack, removeTrack, setPlaylist,
    persistPlaylist,
  ]);

  return (
    <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer(): MusicPlayerContextType {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}
