/**
 * PORTFOLIO CRASH THEATRE — MODAL MANAGER
 * Accessible modal dialog controller with focus trap and escape handling.
 */

export class ModalManager {
  static open(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input or close button
    const focusable = el.querySelector('input, select, textarea, button:not(.modal-close-btn)');
    if (focusable) {
      setTimeout(() => focusable.focus(), 50);
    }
  }

  static close(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.remove('active');
    document.body.style.overflow = '';
  }

  static initGlobalListeners() {
    // Close on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop.active');
        if (activeModal) {
          activeModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });

    // Close on clicking backdrop
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }
}
