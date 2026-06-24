import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, SkipForward, SkipBack, Disc3, Search, Loader2, X, Maximize2, Minimize2, ListMusic, Trash2, Music } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { searchSongs, getSongUrls, feeLabel } from '../../api/music';
import type { SongResult, MusicPlatform } from '../../api/music';
import styles from './VinylPlayer.module.css';

const PLATFORM_OPTIONS: { key: MusicPlatform; label: string }[] = [
  { key: 'ncm', label: '网易云' },
  { key: 'qq', label: 'QQ' },
  { key: 'kugou', label: '酷狗' },
  { key: 'qishui', label: '汽水' },
];


// ---------- Vinyl disc component ----------

function VinylDisc({ spinning }: { spinning: boolean }) {
  return (
    <div className={`${styles.discWrap} ${spinning ? styles.spinning : ''}`}>
      <div className={styles.disc}>
        <div className={styles.discInner}>
          <div className={styles.discHole} />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={styles.groove}
            style={{ width: `${50 + i * 8}%`, height: `${50 + i * 8}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Helpers ----------

function fmtTime(secs: number) {
  if (!isFinite(secs) || secs <= 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------- Progress bar component ----------

function ProgressBar({ pct, currentTime, duration }: { pct: number; currentTime?: number; duration?: number }) {
  return (
    <div className={styles.progressWrap}>
      {currentTime != null && duration != null && (
        <span className={styles.timeLabel}>{fmtTime(currentTime)}</span>
      )}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
      {currentTime != null && duration != null && (
        <span className={styles.timeLabel}>{fmtTime(duration)}</span>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function VinylPlayer() {
  const {
    isPlaying, trackIndex, progress, currentTime, duration, error, playlist, track,
    lyrics, lyricLoading, currentLyricIdx,
    togglePlay, prevTrack, nextTrack, playTrack, addTrack, removeTrack,
    setPlaylistState,
  } = useMusicPlayer();

  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'search' | 'playlist' | 'lyrics'>('search');
  const [showLyrics, setShowLyrics] = useState(false);
  const lyricScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll lyrics in expanded view
  useEffect(() => {
    if (!lyricScrollRef.current || lyrics.length === 0) return;
    const el = lyricScrollRef.current;
    const active = el.querySelector(`.${styles.lyricActive}`) as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLyricIdx, lyrics.length]);

  // Search
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<MusicPlatform>('ncm');
  const [results, setResults] = useState<SongResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');

  const doSearch = useCallback(async (q: string, plat: MusicPlatform) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    setSearchErr('');
    try {
      const data = await searchSongs(q.trim(), 50, plat);
      setResults(data);
      if (data.length === 0) setSearchErr('未找到相关歌曲');
    } catch {
      setSearchErr('搜索失败，请确保音乐服务已启动');
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    doSearch(query, platform);
  }, [doSearch, query, platform]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') doSearch(query, platform);
    },
    [doSearch, query, platform],
  );

  // Re-search when platform changes (if query is non-empty)
  useEffect(() => {
    if (query.trim()) doSearch(query, platform);
  }, [platform]); // eslint-disable-line react-hooks/exhaustive-deps

  const playSong = useCallback(async (song: SongResult) => {
    setResults([]);
    setQuery('');
    setSearchErr('');
    const newTrack = { id: song.id, title: song.name, artist: song.artists.map((a) => a.name).join('/'), src: '', fee: song.fee ?? 8, platform };
    addTrack(newTrack);
    setTab('playlist');
    try {
      const urls = await getSongUrls([song.id], platform);
      const url = urls[0]?.url;
      if (url) {
        setPlaylistState((prev) => prev.map((t) => t.id === song.id ? { ...t, src: url } : t));
      }
    } catch { /* URL fetch failed, will retry on play */ }
  }, [addTrack, platform, setPlaylistState]);

  const handleRemoveTrack = useCallback((idx: number) => {
    removeTrack(idx);
  }, [removeTrack]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!expanded && !showLyrics) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setExpanded(false); setShowLyrics(false); return; }
      if (e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        togglePlay();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded, showLyrics, togglePlay]);

  // ======== COMPACT CARD ========

  const compact = (
    <div className={styles.card}>
      <div className={styles.header}>
        <Disc3 size={16} className={styles.headerIcon} />
        <span>黑胶唱片</span>
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded(true)}
          title="放大窗口"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <div className={styles.player}>
        <VinylDisc spinning={isPlaying} />

        <div className={styles.info}>
          <div className={styles.trackTitle}>{track.title}</div>
          <div className={styles.trackArtist}>{track.artist}</div>

          {error ? (
            <div className={styles.errorText}>无法播放此曲目</div>
          ) : (
            <>
              <ProgressBar pct={progress} currentTime={currentTime} duration={duration} />
              <div className={styles.controls}>
                <button className={styles.nextBtn} onClick={prevTrack}>
                  <SkipBack size={16} />
                </button>
                <button className={styles.playBtn} onClick={togglePlay}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button className={styles.nextBtn} onClick={nextTrack}>
                  <SkipForward size={16} />
                </button>
                <button
                  className={`${styles.nextBtn} ${showLyrics ? styles.lyricBtnActive : ''}`}
                  onClick={() => setShowLyrics(!showLyrics)}
                  title="歌词"
                  style={{ fontSize: '0.7rem', fontWeight: 700 }}
                >
                  词
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ======== EXPANDED OVERLAY ========

  const expandedOverlay = expanded
    ? createPortal(
        <div className={styles.overlay} onClick={() => setExpanded(false)}>
          <div
            className={styles.floating}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.floatHeader}>
              <div className={styles.floatHeaderLeft}>
                <Disc3 size={18} className={styles.headerIcon} />
                <span>黑胶唱片</span>
              </div>
              <button
                className={styles.floatClose}
                onClick={() => setExpanded(false)}
              >
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.floatBody}>
              {/* Left: vinyl + now-playing */}
              <div className={styles.floatLeft}>
                <VinylDisc spinning={isPlaying} />
                <div className={styles.nowPlaying}>
                  <div className={styles.trackTitle}>{track.title}</div>
                  <div className={styles.trackArtist}>{track.artist}</div>
                  {error ? (
                    <div className={styles.errorText}>无法播放此曲目</div>
                  ) : (
                    <ProgressBar pct={progress} currentTime={currentTime} duration={duration} />
                  )}
                </div>
                <div className={styles.controls}>
                  <button className={styles.nextBtn} onClick={prevTrack}>
                    <SkipBack size={18} />
                  </button>
                  <button className={styles.playBtn} onClick={togglePlay}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button className={styles.nextBtn} onClick={nextTrack}>
                    <SkipForward size={18} />
                  </button>
                </div>
              </div>

              {/* Right: tabs */}
              <div className={styles.floatRight}>
                <div className={styles.tabs}>
                  <button
                    className={`${styles.tab} ${tab === 'search' ? styles.tabActive : ''}`}
                    onClick={() => setTab('search')}
                  >
                    <Search size={14} /> 搜索
                  </button>
                  <button
                    className={`${styles.tab} ${tab === 'lyrics' ? styles.tabActive : ''}`}
                    onClick={() => setTab('lyrics')}
                  >
                    <Music size={14} /> 歌词
                  </button>
                  <button
                    className={`${styles.tab} ${tab === 'playlist' ? styles.tabActive : ''}`}
                    onClick={() => setTab('playlist')}
                  >
                    <ListMusic size={14} /> 列表
                  </button>
                </div>

                {tab === 'search' && (
                  <div className={styles.tabContent}>
                    <div className={styles.searchInputRow}>
                      <input
                        className={styles.searchInput}
                        type="text"
                        placeholder={`搜索${PLATFORM_OPTIONS.find((p) => p.key === platform)?.label || ''}歌曲...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        autoFocus
                      />
                      {query && (
                        <button className={styles.searchClose} onClick={() => { setQuery(''); setResults([]); }}>
                          <X size={14} />
                        </button>
                      )}
                      <button
                        className={styles.searchBtn}
                        onClick={handleSearch}
                        disabled={searching || !query.trim()}
                        title="搜索"
                      >
                        {searching ? <Loader2 size={14} className={styles.spinner} /> : <Search size={14} />}
                      </button>
                    </div>
                    <div className={styles.platformTabs}>
                      {PLATFORM_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          className={`${styles.platformTab} ${platform === opt.key ? styles.platformTabActive : ''}`}
                          onClick={() => setPlatform(opt.key)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <div className={styles.searchResults}>
                      {searching && (
                        <div className={styles.searchStatus}>
                          <Loader2 size={14} className={styles.spinner} /> 搜索中...
                        </div>
                      )}
                      {searchErr && !searching && (
                        <div className={styles.searchStatus}>{searchErr}</div>
                      )}
                      {results.map((song) => {
                        const fee = feeLabel(song.fee ?? 8);
                        return (
                          <button
                            key={song.id}
                            className={styles.songItem}
                            onClick={() => playSong(song)}
                          >
                            <div className={styles.songInfo}>
                              <div className={styles.songNameRow}>
                                <span className={styles.songName}>{song.name}</span>
                                <span className={`${styles.feeBadge} ${styles[fee.cls]}`}>{fee.text}</span>
                              </div>
                              <span className={styles.songArtist}>
                                {song.artists.map((a) => a.name).join('/')}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tab === 'lyrics' && (
                  <div className={styles.tabContent} ref={lyricScrollRef}>
                    {lyricLoading && (
                      <div className={styles.searchStatus}>
                        <Loader2 size={14} className={styles.spinner} /> 加载歌词中...
                      </div>
                    )}
                    {!lyricLoading && lyrics.length === 0 && (
                      <div className={styles.searchStatus}>
                        {track.id > 0 ? '暂无歌词' : '当前为默认曲目，不支持歌词'}
                      </div>
                    )}
                    {lyrics.map((line, i) => (
                      <p
                        key={i}
                        className={`${styles.lyricLine} ${i === currentLyricIdx ? styles.lyricActive : ''}`}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                )}

                {tab === 'playlist' && (
                  <div className={styles.tabContent}>
                    {playlist.length === 0 && (
                      <div className={styles.searchStatus}>播放列表为空</div>
                    )}
                    {playlist.map((t, i) => {
                      const fee = feeLabel(t.fee ?? 0);
                      return (
                        <div
                          key={t.id}
                          className={`${styles.playlistItem} ${i === trackIndex ? styles.playlistActive : ''}`}
                          onClick={() => playTrack(i)}
                        >
                          <span className={styles.playlistIdx}>
                            {i === trackIndex && isPlaying
                              ? <span className={styles.playingDot} />
                              : i + 1
                            }
                          </span>
                          <div className={styles.songInfo}>
                            <div className={styles.songNameRow}>
                              <span className={styles.songName}>{t.title}</span>
                              {t.id > 0 && (
                                <span className={`${styles.platformBadge} ${styles[`platform${t.platform.charAt(0).toUpperCase() + t.platform.slice(1)}`] || ''}`}>
                                  {PLATFORM_OPTIONS.find((p) => p.key === t.platform)?.label || t.platform}
                                </span>
                              )}
                              {t.id > 0 && (
                                <span className={`${styles.feeBadge} ${styles[fee.cls]}`}>{fee.text}</span>
                              )}
                            </div>
                            <span className={styles.songArtist}>{t.artist}</span>
                          </div>
                          {playlist.length > 1 && (
                            <button
                              className={styles.removeBtn}
                              onClick={(e) => { e.stopPropagation(); handleRemoveTrack(i); }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  // ======== DESKTOP LYRICS ========

  const [lyricsPos, setLyricsPos] = useState({ x: 0, y: 0 });
  const lyricsDragRef = useRef({ x: 0, y: 0 });
  const lyricsPanelRef = useRef<HTMLDivElement>(null);
  const lyricsInitRef = useRef(false);

  // Initialize lyrics position centered at top
  useEffect(() => {
    if (showLyrics && !lyricsInitRef.current) {
      lyricsInitRef.current = true;
      setLyricsPos({
        x: Math.max(0, (window.innerWidth - 600) / 2),
        y: 0,
      });
    }
    if (!showLyrics) {
      lyricsInitRef.current = false;
    }
  }, [showLyrics]);

  const handleLyricsDragStart = useCallback((e: React.PointerEvent) => {
    const el = lyricsPanelRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    lyricsDragRef.current = { x: e.clientX - lyricsPos.x, y: e.clientY - lyricsPos.y };
  }, [lyricsPos]);

  const handleLyricsDragMove = useCallback((e: React.PointerEvent) => {
    const el = lyricsPanelRef.current;
    if (!el || !el.hasPointerCapture(e.pointerId)) return;
    setLyricsPos({
      x: Math.max(0, Math.min(e.clientX - lyricsDragRef.current.x, window.innerWidth - 600)),
      y: Math.max(0, Math.min(e.clientY - lyricsDragRef.current.y, window.innerHeight - 120)),
    });
  }, []);

  const handleLyricsDragEnd = useCallback((e: React.PointerEvent) => {
    const el = lyricsPanelRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  }, []);

  const desktopLyrics = showLyrics
    ? createPortal(
        <div
          ref={lyricsPanelRef}
          className={styles.desktopLyrics}
          style={{ left: lyricsPos.x, top: lyricsPos.y }}
          onPointerDown={handleLyricsDragStart}
          onPointerMove={handleLyricsDragMove}
          onPointerUp={handleLyricsDragEnd}
        >
          <div className={styles.desktopLyricsTitle}>
            <Music size={12} />
            <span>{track.title}</span>
            <span className={styles.desktopLyricsArtist}>— {track.artist}</span>
            <button className={styles.desktopLyricsClose} onClick={() => setShowLyrics(false)}>
              <X size={12} />
            </button>
          </div>
          <div className={styles.desktopLyricsBody} ref={lyricScrollRef}>
            {lyricLoading ? (
              <span className={styles.desktopLyricsLine}><Loader2 size={12} className={styles.spinner} /> 加载中...</span>
            ) : lyrics.length === 0 ? (
              <span className={styles.desktopLyricsLine}>{track.id > 0 ? '暂无歌词' : '当前为默认曲目，不支持歌词'}</span>
            ) : currentLyricIdx >= 0 ? (
              <>
                {currentLyricIdx > 0 && (
                  <span className={styles.desktopLyricsPrev}>{lyrics[currentLyricIdx - 1]?.text}</span>
                )}
                <span className={styles.desktopLyricsCurrent}>{lyrics[currentLyricIdx]?.text}</span>
                {currentLyricIdx < lyrics.length - 1 && (
                  <span className={styles.desktopLyricsNext}>{lyrics[currentLyricIdx + 1]?.text}</span>
                )}
              </>
            ) : (
              <span className={styles.desktopLyricsWaiting}>♪ 等待歌词...</span>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {compact}
      {expandedOverlay}
      {desktopLyrics}
    </>
  );
}
