/**
 * PORTFOLIO CRASH THEATRE — NAVIGATION CONTROLLER
 * Sidebar collapsing, mobile drawer toggling, active route indication, and fullscreen orchestration.
 */

export class NavigationManager {
  constructor(router) {
    this.router = router;
    this.sidebar = document.getElementById('sidebar');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
    this.btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    this.btnMobileMenu = document.getElementById('btn-mobile-menu');
    this.btnFullscreen = document.getElementById('btn-toggle-fullscreen');
    this.theatreContainer = document.getElementById('theatre-container');

    this._bindEvents();
  }

  _bindEvents() {
    // Desktop sidebar collapse toggle
    if (this.btnToggleSidebar) {
      this.btnToggleSidebar.addEventListener('click', () => {
        this.sidebar?.classList.toggle('collapsed');
      });
    }

    // Mobile drawer toggle
    if (this.btnMobileMenu) {
      this.btnMobileMenu.addEventListener('click', () => {
        this.sidebar?.classList.toggle('mobile-open');
        this.drawerBackdrop?.classList.toggle('active');
      });
    }

    // Close mobile drawer on backdrop click
    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => {
        this.sidebar?.classList.remove('mobile-open');
        this.drawerBackdrop?.classList.remove('active');
      });
    }

    // Close mobile drawer when clicking a navigation link
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
      link.addEventListener('click', () => {
        this.sidebar?.classList.remove('mobile-open');
        this.drawerBackdrop?.classList.remove('active');
      });
    });

    // Fullscreen theatre toggle
    if (this.btnFullscreen && this.theatreContainer) {
      this.btnFullscreen.addEventListener('click', () => {
        const isFullscreen = this.theatreContainer.classList.toggle('fullscreen');
        if (isFullscreen) {
          // Navigate to theatre if not already there
          window.location.hash = '#theatre';
        }
      });
    }

    // Quick launch crisis button in sidebar
    const btnQuickLaunch = document.getElementById('btn-quick-launch-crisis');
    if (btnQuickLaunch) {
      btnQuickLaunch.addEventListener('click', () => {
        window.location.hash = '#theatre';
      });
    }
  }

  setActiveView(viewId) {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}
