// Workaround for an API-Sports widgets 3.1.0 bug.
//
// The widget's <nav-tab> component only assigns `this.widget` from its
// connectedCallback. When a widget is detached from the page while its API
// request is still in flight (navigating away mid-load, switching seasons
// quickly, replacing a widget, closing a modal), the library keeps rendering
// the orphaned tree and appends a <nav-tab> that never connects. Its deferred
// requestAnimationFrame callback then calls:
//
//     this.widget.createWidgetIcons()
//
// with `this.widget === undefined`, throwing:
//
//     TypeError: Cannot read properties of undefined (reading 'createWidgetIcons')
//         at widgets.api-sports.io/3.1.0/widgets.js:2:235418
//
// Attached nav-tabs still receive the real widget in connectedCallback, so the
// stub below is only ever used by discarded instances.
const installNavTabPatch = () => {
  if (typeof window === "undefined" || !window.customElements) return;
  if (!window.customElements.get("nav-tab")) return;

  const NavTab = window.customElements.get("nav-tab");
  if (!NavTab || NavTab.prototype.__footyStatsPatched) return;

  const originalRender = NavTab.prototype.render;

  NavTab.prototype.render = function patchedRender(...args) {
    if (!this.widget) {
      // Never connected: nothing visible depends on these icons.
      this.widget = { createWidgetIcons() {}, showImages() {} };
    }
    return originalRender.apply(this, args);
  };

  NavTab.prototype.__footyStatsPatched = true;
};

if (typeof window !== "undefined" && window.customElements) {
  // `nav-tab` is registered lazily when the first widget needs it.
  if (!installNavTabPatch()) {
    window.customElements.whenDefined("nav-tab").then(installNavTabPatch);
  }
}
