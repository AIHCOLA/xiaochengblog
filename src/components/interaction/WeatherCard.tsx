import { useState, useEffect, useRef } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, Wind, Droplets } from 'lucide-react';
import { getWeather, type WeatherData } from '../../api/weather';
import styles from './WeatherCard.module.css';

const CACHE_KEY = 'blog_weather';
const CACHE_TTL = 15 * 60 * 1000;

const ICON_MAP: Record<WeatherData['icon'], React.FC<{ size?: number }>> = {
  sunny: Sun,
  cloudy: Cloud,
  partly: CloudSun,
  rain: CloudRain,
};

interface GeoInfo {
  city: string;
  lat: number;
  lon: number;
}

interface CacheEntry {
  weather: WeatherData;
  cityName: string;
  ts: number;
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts < CACHE_TTL) return entry;
  } catch {}
  return null;
}

function writeCache(weather: WeatherData, cityName: string) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ weather, cityName, ts: Date.now() }));
  } catch {}
}

async function detectLocation(): Promise<GeoInfo | null> {
  try {
    const resp = await fetch('http://ip-api.com/json/?fields=city,lat,lon&lang=zh-CN');
    const data = await resp.json();
    if (data && data.city && data.lat && data.lon) {
      return { city: data.city, lat: data.lat, lon: data.lon };
    }
  } catch {}
  return null;
}

export function WeatherCard() {
  const cached = useRef(readCache());
  const [weather, setWeather] = useState<WeatherData | null>(cached.current?.weather ?? null);
  const [loading, setLoading] = useState(!cached.current);
  const [error, setError] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [cityName, setCityName] = useState(cached.current?.cityName ?? '你的位置');

  useEffect(() => {
    detectLocation()
      .then((geo) => {
        if (geo) {
          setCityName(geo.city);
          return getWeather(geo.lat, geo.lon).then((d) => ({ data: d, city: geo.city }));
        }
        return getWeather().then((d) => ({ data: d, city: cityName }));
      })
      .then(({ data, city }) => {
        setWeather(data);
        setError(false);
        writeCache(data, city);
      })
      .catch(() => {
        if (!cached.current) setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const Icon = weather ? ICON_MAP[weather.icon] : null;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <CloudSun size={16} />
        今日天气
        <span className={styles.time}>{timeStr}</span>
      </h3>

      {loading ? (
        <div className={styles.main}>
          <span className={styles.loading}>加载中...</span>
        </div>
      ) : error || !weather || !Icon ? (
        <div className={styles.main}>
          <span className={styles.loading}>天气不可用</span>
        </div>
      ) : (
        <>
          <div className={styles.main}>
            <div className={`${styles.iconWrap} ${styles[weather.icon]}`}>
              <Icon size={40} />
            </div>
            <div className={styles.tempBlock}>
              <span className={styles.temp}>{weather.temp}°</span>
              <span className={styles.condition}>{weather.condition}</span>
              <span className={styles.range}>
                {weather.high}° / {weather.low}°
              </span>
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.detail}>
              <Droplets size={13} />
              <span>湿度 {weather.humidity}%</span>
            </div>
            <div className={styles.detail}>
              <Wind size={13} />
              <span>{weather.wind}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.locDot} />
              <span>{cityName}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
