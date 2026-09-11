export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.actions = new Set();
    this.touchState = { left: false, right: false, block: false };
    this.bind();
  }

  bind() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const code = event.code || '';
      if (['a', 'd', 'j', 'k', 'l', 'i', 's', ' ', 'arrowleft', 'arrowright', 'escape'].includes(key) || code === 'Space') {
        event.preventDefault();
      }
      this.keys.add(key);

      if (key === 'a' || key === 'arrowleft') this.actions.add('left');
      if (key === 'd' || key === 'arrowright') this.actions.add('right');
      if (key === 'j') this.actions.add('jab');
      if (key === 'k') this.actions.add('cross');
      if (key === 'l') this.actions.add('hook');
      if (key === 'i') this.actions.add('uppercut');
      if (key === 's') this.actions.add('block');
      if (key === ' ' || code === 'Space') this.actions.add('dodge');
      if (key === 'escape') this.actions.add('pause');
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      this.keys.delete(key);
    });

    document.querySelectorAll('[data-action]').forEach((button) => {
      const action = button.dataset.action;
      const press = (event) => {
        event.preventDefault();
        if (action === 'left' || action === 'right') {
          this.touchState[action] = true;
          this.actions.add(action);
        } else if (action === 'block') {
          this.touchState.block = true;
          this.actions.add('block');
        } else {
          this.actions.add(action);
        }
        button.classList.add('pressed');
      };
      const release = (event) => {
        event.preventDefault();
        if (action === 'left' || action === 'right') {
          this.touchState[action] = false;
          this.actions.delete(action);
        } else if (action === 'block') {
          this.touchState.block = false;
          this.actions.delete('block');
        }
        button.classList.remove('pressed');
      };
      button.addEventListener('pointerdown', press);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointerleave', release);
      button.addEventListener('pointercancel', release);
    });
  }

  isHeld(action) {
    if (action === 'left') return this.keys.has('a') || this.keys.has('arrowleft') || this.touchState.left;
    if (action === 'right') return this.keys.has('d') || this.keys.has('arrowright') || this.touchState.right;
    if (action === 'block') return this.keys.has('s') || this.touchState.block;
    return false;
  }

  consume(action) {
    if (this.actions.has(action)) {
      this.actions.delete(action);
      return true;
    }
    return false;
  }
}
