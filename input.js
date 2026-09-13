export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.actions = new Set();
    this.touchState = { left: false, right: false, block: false };
    this.joystick = { active: false, x: 0, y: 0 };
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
      if (key === 'v') this.actions.add('special');
      if (key === 's') this.actions.add('block');
      if (key === ' ' || code === 'Space') this.actions.add('dodge');
      if (key === 'escape') this.actions.add('pause');
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      this.keys.delete(key);
    });

    const joystickPad = document.getElementById('joystickPad');
    const joystickKnob = document.getElementById('joystickKnob');

    if (joystickPad && joystickKnob) {
      const moveJoystick = (clientX, clientY) => {
        const rect = joystickPad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const radius = rect.width * 0.33;
        const distance = Math.min(Math.hypot(dx, dy), radius);
        const angle = Math.atan2(dy, dx);

        this.joystick.x = Math.cos(angle) * distance / radius;
        this.joystick.y = Math.sin(angle) * distance / radius;

        const knobX = Math.cos(angle) * distance;
        const knobY = Math.sin(angle) * distance;
        joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

        this.touchState.left = this.joystick.x < -0.18;
        this.touchState.right = this.joystick.x > 0.18;
      };

      const resetJoystick = () => {
        this.joystick.active = false;
        this.joystick.x = 0;
        this.joystick.y = 0;
        this.touchState.left = false;
        this.touchState.right = false;
        joystickKnob.style.transform = 'translate(-50%, -50%)';
      };

      joystickPad.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        this.joystick.active = true;
        if (joystickPad.setPointerCapture) {
          joystickPad.setPointerCapture(event.pointerId);
        }
        moveJoystick(event.clientX, event.clientY);
      });

      joystickPad.addEventListener('pointermove', (event) => {
        if (!this.joystick.active) return;
        moveJoystick(event.clientX, event.clientY);
      });

      joystickPad.addEventListener('pointerup', () => resetJoystick());
      joystickPad.addEventListener('pointercancel', () => resetJoystick());
      joystickPad.addEventListener('pointerleave', () => {
        if (!this.joystick.active) return;
        resetJoystick();
      });
    }

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
