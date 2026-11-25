/**
 * PORTFOLIO CRASH THEATRE — TOAST NOTIFICATIONS CONTROLLER
 * Safe, accessible notifications with XSS-free DOM node generation.
 */

export class NotificationManager {
  constructor() {
    this.container = document.getElementById('toast-container');
  }

  show(title, message, type = 'info', duration = 4000) {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
    }
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Safe DOM construction to prevent XSS
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.textContent = type === 'success' ? '✓' : (type === 'danger' ? '⚠' : 'ℹ');

    const content = document.createElement('div');
    content.className = 'toast-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;

    const msgEl = document.createElement('div');
    msgEl.className = 'toast-message';
    msgEl.textContent = message;

    content.appendChild(titleEl);
    content.appendChild(msgEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => this._remove(toast);

    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(closeBtn);

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this._remove(toast), duration);
    }
  }

  _remove(toast) {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  }

  success(title, message) { this.show(title, message, 'success'); }
  danger(title, message) { this.show(title, message, 'danger'); }
  warning(title, message) { this.show(title, message, 'warning'); }
  info(title, message) { this.show(title, message, 'info'); }
}

export const notifications = new NotificationManager();
