// Screener layout — header is rendered directly in each page via ScreenerHeader component
// This wrapper intentionally has no shared header/nav to allow full screener isolation
export default function ScreenerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
