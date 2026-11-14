import { useEffect, useRef, useState } from "react";
import Loader from "./Loader";

const INIT_TIMEOUT_MS = 15000;
const STUCK_TIMEOUT_MS = 20000;

function applyAttributes(element, attributes) {
  Object.entries(attributes).forEach(([name, value]) => {
    if (value === undefined || value === null || value === false) return;
    element.setAttribute(name, value === true ? "true" : String(value));
  });
}

/**
 * Renders an API-Sports widget safely inside React.
 *
 * The widget script only scans the page on DOMContentLoaded and its
 * MutationObserver only notices widgets inserted directly into the DOM.
 * React mounts the whole tree in one commit, so a widget rendered in JSX can
 * be missed entirely (blank area). Creating and appending the element after
 * mount guarantees the observer sees it and initialises the widget.
 */
function ApiSportsWidget({ attributes = {}, label = "Loading…" }) {
  const hostRef = useRef(null);
  const attributesRef = useRef(attributes);
  attributesRef.current = attributes;

  // Stable dependency for the effect even though `attributes` is a new object
  // on every parent render.
  const signature = JSON.stringify(attributes);

  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    setStatus("loading");

    let element = null;
    let observer = null;
    let initTimer = null;
    let stuckTimer = null;
    let disposed = false;

    const markReady = () => {
      if (disposed) return;
      setStatus("ready");

      // The widget renders before its API request finishes. If it is still
      // showing its internal spinner after a generous wait, surface a retry.
      stuckTimer = setTimeout(() => {
        if (disposed || !element) return;
        if (element.querySelector(".loading-block, .wg_loader")) {
          setStatus("error");
        }
      }, STUCK_TIMEOUT_MS);
    };

    const markError = () => {
      if (!disposed) setStatus("error");
    };

    const start = () => {
      if (disposed) return;

      element = document.createElement("api-sports-widget");
      applyAttributes(element, attributesRef.current);
      host.appendChild(element);

      if (element.classList.contains("initialized")) {
        markReady();
        return;
      }

      // `initialized` is added once the widget has rendered its shell.
      observer = new MutationObserver(() => {
        if (!element.classList.contains("initialized")) return;
        observer.disconnect();
        observer = null;
        clearTimeout(initTimer);
        markReady();
      });
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["class"],
      });

      initTimer = setTimeout(() => {
        if (!disposed && !element.classList.contains("initialized")) {
          markError();
        }
      }, INIT_TIMEOUT_MS);
    };

    // Deferring by a tick lets StrictMode's dev-only mount/unmount cycle cancel
    // the first attempt, so only one widget is created per mount.
    const createTimer = setTimeout(start, 0);

    return () => {
      disposed = true;
      clearTimeout(createTimer);
      clearTimeout(initTimer);
      clearTimeout(stuckTimer);
      if (observer) observer.disconnect();
      if (element) element.remove();
    };
  }, [signature, attempt]);

  return (
    <div className="widget-shell">
      <div ref={hostRef} className="widget-host" hidden={status === "error"} />

      {status === "loading" && (
        <div className="widget-status">
          <Loader label={label} />
        </div>
      )}

      {status === "error" && (
        <div className="widget-status">
          <div className="alert" role="alert">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <div>
              <p>
                This widget is taking too long to load. Check your connection or
                any ad blocker, then try again.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setAttempt((count) => count + 1)}
              >
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiSportsWidget;
