import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./header";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <main className="app-container fade-in" key={pathname}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Data provided by API-Football</span>
        <span className="site-footer-dot" aria-hidden="true">•</span>
        <span>Footy Stats</span>
      </footer>
    </div>
  );
}

export default Layout;
