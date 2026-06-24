import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ToastProvider } from './context/ToastContext';
import { PostsProvider } from './context/PostsContext';
import { ToastContainer } from './components/ui/Toast';
import { BackToTop } from './components/ui/BackToTop';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoading } from './components/ui/PageLoading';
import { DesktopPet } from './components/interaction/DesktopPet';
import { DesktopGirl } from './components/interaction/DesktopGirl';

// Lazy-loaded page components — splits heavy libs (recharts, dnd-kit, react-markdown) into per-route chunks
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage').then(m => ({ default: m.ArticlesPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(m => ({ default: m.ArticlePage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const TagPage = lazy(() => import('./pages/TagPage').then(m => ({ default: m.TagPage })));
const ArchivePage = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const GuestbookPage = lazy(() => import('./pages/GuestbookPage').then(m => ({ default: m.GuestbookPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PublishPage = lazy(() => import('./pages/PublishPage').then(m => ({ default: m.PublishPage })));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage').then(m => ({ default: m.OAuthCallbackPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function PageFallback() {
  return <PageLoading />;
}

import { MusicPlayerProvider } from './context/MusicPlayerContext';

// ...

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <PostsProvider>
            <FavoritesProvider>
            <MusicPlayerProvider>
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/tag/:slug" element={<TagPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/guestbook" element={<GuestbookPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/publish" element={<PublishPage />} />
              <Route path="/publish/:slug" element={<PublishPage />} />
              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
            <ToastContainer />
            <BackToTop />
            <DesktopPet />
            <DesktopGirl />
            </ErrorBoundary>
            </MusicPlayerProvider>
          </FavoritesProvider>
            </PostsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
    </BrowserRouter>
  );
}
