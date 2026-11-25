/**
 * PORTFOLIO CRASH THEATRE — CLIENT-SIDE HASH ROUTER
 * Seamless view switching, URL synchronization, and lifecycle view activation.
 */

export class Router {
  constructor(routes = {}) {
    this.routes = routes; // { 'dashboard': dashboardView, 'portfolio': portfolioView, ... }
    this.activeRoute = null;
    this.titleEl = document.getElementById('page-title');
    this.descEl = document.getElementById('page-description');

    window.addEventListener('hashchange', () => this._handleRoute());
  }

  init() {
    this._handleRoute();
  }

  _handleRoute() {
    let hash = window.location.hash.replace('#', '').trim();
    if (!hash || !this.routes[hash]) {
      hash = 'dashboard';
    }

    this.navigate(hash, false);
  }

  navigate(viewId, updateHash = true) {
    if (updateHash) {
      window.location.hash = `#${viewId}`;
      return;
    }

    const previousRoute = this.activeRoute;
    if (previousRoute && this.routes[previousRoute]?.onLeave) {
      this.routes[previousRoute].onLeave();
    }

    // Toggle active view sections in DOM
    const targetSection = document.getElementById(`view-${viewId}`);
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    if (targetSection) {
      targetSection.classList.add('active');

      // Update header titles
      const title = targetSection.getAttribute('data-title') || 'Portfolio Crash Theatre';
      const desc = targetSection.getAttribute('data-desc') || '';
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.descEl) this.descEl.textContent = desc;
    }

    this.activeRoute = viewId;

    // Trigger onEnter lifecycle hook
    if (this.routes[viewId]?.onEnter) {
      this.routes[viewId].onEnter();
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
