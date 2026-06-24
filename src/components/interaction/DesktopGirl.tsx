import { useCallback, useEffect, useRef, useState } from 'react';

const GIRL_VISIBLE_KEY = 'blog_desktop_girl_visible';
const GIRL_MODEL_KEY = 'blog_girl_model';

// Live2D widget CDN
const WIDGET_SCRIPT = 'https://fastly.jsdelivr.net/npm/live2d-widget@3.0.4/lib/L2Dwidget.min.js';
const WIDGET_CHUNK = 'https://fastly.jsdelivr.net/npm/live2d-widget@3.0.4/lib/L2Dwidget.0.min.js';

// Available models (free, CDN-hosted) — 21 models from the live2d-widget ecosystem
const MODELS: { id: string; name: string; url: string }[] = [
  { id: 'haru', name: 'Haru', url: 'https://fastly.jsdelivr.net/npm/live2d-widget-model-haru@1.0.5/01/assets/haru01.model.json' },
  { id: 'haru02', name: 'Haru 02', url: 'https://fastly.jsdelivr.net/npm/live2d-widget-model-haru@1.0.5/02/assets/haru02.model.json' },
  { id: 'shizuku', name: 'Shizuku', url: 'https://fastly.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json' },
  { id: 'tororo', name: 'Tororo', url: 'https://fastly.jsdelivr.net/npm/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json' },
  { id: 'wanko', name: 'Wanko', url: 'https://fastly.jsdelivr.net/npm/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json' },
  { id: 'hijiki', name: 'Hijiki', url: 'https://fastly.jsdelivr.net/npm/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json' },
  { id: 'koharu', name: 'Koharu', url: 'https://fastly.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json' },
];

declare global {
  interface Window {
    L2Dwidget?: {
      init: (config: Record<string, unknown>) => void;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

// Module-level state for deduplication across hot-reloads
let widgetInitialized = false;
let loadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureWidgetLoaded(): Promise<void> {
  if (widgetInitialized) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    await loadScript(WIDGET_CHUNK);
    await loadScript(WIDGET_SCRIPT);
    widgetInitialized = true;
  })();
  return loadPromise;
}

/** Remove the existing Live2D widget DOM so a fresh one can be created */
function destroyWidget() {
  const div = document.getElementById('live2d-widget');
  if (div) div.remove();
  const canvas = document.getElementById('live2dcanvas');
  if (canvas) canvas.remove();
  // Also clean up any leftover tip/info elements the widget may have created
  document.querySelectorAll('[id^="live2d"]').forEach((el) => el.remove());
}

export function DesktopGirl() {
  const [visible, setVisible] = useState(() => {
    const v = localStorage.getItem(GIRL_VISIBLE_KEY);
    return v !== null ? v === 'true' : true;
  });
  const [currentModel, setCurrentModel] = useState(() => {
    return localStorage.getItem(GIRL_MODEL_KEY) || 'haru';
  });
  const [loaded, setLoaded] = useState(false);
  // Bump this to force widget re-initialization with a new model
  const [modelVersion, setModelVersion] = useState(0);

  const modelRef = useRef(currentModel);
  modelRef.current = currentModel;

  // ── Visibility sync with CardPalette ──
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GIRL_VISIBLE_KEY) setVisible(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Initialize Live2D widget ──
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    ensureWidgetLoaded()
      .then(() => {
        if (cancelled || !window.L2Dwidget) return;

        const model = MODELS.find((m) => m.id === modelRef.current) || MODELS[0];

        window.L2Dwidget.init({
          model: { jsonPath: model.url, scale: 1 },
          display: {
            superSample: 2,
            width: 200,
            height: 360,
            position: 'right',
            hOffset: 80,
            vOffset: -60,
          },
          mobile: { show: true, scale: 0.5, motion: true },
          name: { canvas: 'live2dcanvas', div: 'live2d-widget' },
          react: { opacity: 0.85 },
          dev: { border: false },
          dialog: { enable: true, hitokoto: true },
        });

        setLoaded(true);
      })
      .catch((err) => {
        console.warn('Failed to load Live2D widget:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, modelVersion]); // re-run when modelVersion changes

  // ── Toggle visibility ──
  useEffect(() => {
    const widgetDiv = document.getElementById('live2d-widget');
    if (widgetDiv) widgetDiv.style.display = visible ? 'block' : 'none';
  }, [visible, loaded]);

  // ── Keyboard shortcut: Ctrl+→ / Ctrl+← to cycle models ──
  const switchModel = useCallback((direction: 'next' | 'prev') => {
    const idx = MODELS.findIndex((m) => m.id === modelRef.current);
    const nextModel =
      direction === 'next'
        ? MODELS[(idx + 1) % MODELS.length]
        : MODELS[(idx - 1 + MODELS.length) % MODELS.length];

    // Tear down old widget
    destroyWidget();
    widgetInitialized = false;
    loadPromise = null;

    // Update model
    setCurrentModel(nextModel.id);
    localStorage.setItem(GIRL_MODEL_KEY, nextModel.id);

    // Trigger re-init
    setModelVersion((v) => v + 1);

    // Brief toast-like label
    showModelLabel(nextModel.name);
  }, []);

  useEffect(() => {
    if (!loaded || !visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Only handle when focus is NOT in an input/textarea/contenteditable
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      if (isInput || isEditable) return;

      // Ctrl+→  next model    Ctrl+←  prev model
      if (e.ctrlKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        e.stopPropagation();
        switchModel(e.key === 'ArrowRight' ? 'next' : 'prev');
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [loaded, visible, switchModel]);

  return null;
}

// ── Floating label to show model name on switch ──
function showModelLabel(name: string) {
  // Remove any existing label
  document.querySelectorAll('[data-girl-model-label]').forEach((el) => el.remove());

  const label = document.createElement('div');
  label.setAttribute('data-girl-model-label', 'true');
  label.textContent = `💖 ${name}`;
  Object.assign(label.style, {
    position: 'fixed',
    bottom: '80px',
    right: '120px',
    zIndex: '10000',
    background: 'rgba(108, 92, 231, 0.9)',
    color: '#fff',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    pointerEvents: 'none',
    animation: 'girlModelFade 2s ease-out forwards',
    fontFamily: 'system-ui, sans-serif',
  });

  // Inject keyframe once
  if (!document.getElementById('girl-model-label-style')) {
    const style = document.createElement('style');
    style.id = 'girl-model-label-style';
    style.textContent =
      '@keyframes girlModelFade{0%{opacity:1;transform:translateY(0)}70%{opacity:1;transform:translateY(-10px)}100%{opacity:0;transform:translateY(-30px)}}';
    document.head.appendChild(style);
  }

  document.body.appendChild(label);

  setTimeout(() => label.remove(), 2100);
}

export { MODELS, GIRL_VISIBLE_KEY };
