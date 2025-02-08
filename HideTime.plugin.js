/**
 * @name HideTime
 * @author Drxve
 * @description Hide the messages time by pressing keybind.
 * @updateUrl https://raw.githubusercontent.com/Drxvee/hidetime/refs/heads/main/HideTime.plugin.js
 * @version 1.0.1
 */

module.exports = class MyPlugin {
  constructor(meta) {
    this.enabled = false;
    this.keyDownHandler = null;
    this.mutationObserver = null;
  }

  start() {
    this.keyDownHandler = (event) => {
      if (event.key === 'F10') {
        this.enabled = !this.enabled;
        this.toggleTimeFormat();
      }
    };
    document.addEventListener('keydown', this.keyDownHandler);

    this.mutationObserver = new MutationObserver(() => {
      this.toggleTimeFormat();
    });
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.updateInterval = setInterval(() => {
      this.toggleTimeFormat();
    }, 1000);
  }

  stop() {
    document.removeEventListener('keydown', this.keyDownHandler);
    this.mutationObserver.disconnect();
    clearInterval(this.updateInterval);
  }

  toggleTimeFormat() {
    // Toggle time elements
    const timeElements = document.querySelectorAll('time');
    timeElements.forEach((timeElement) => {
      const datetime = timeElement.getAttribute('datetime');
      const relativeTime = this.getRelativeTime(datetime);
      if (this.enabled) {
        timeElement.textContent = relativeTime;
      } else {
        timeElement.textContent = timeElement.getAttribute('aria-label');
      }
    });

    // Toggle separators (daily update elements)
    const separators = document.querySelectorAll('[role="separator"]');
    separators.forEach((separator) => {
      if (this.enabled) {
        separator.style.display = 'none';
      } else {
        separator.style.display = '';
      }
    });
  }

  getRelativeTime(datetime) {
    const timestamp = new Date(datetime).getTime();
    const now = new Date().getTime();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      let timeString = `${days}d${days > 1 ? '' : ''}`;
      if (hours % 24 > 0) {
        timeString += ` ${hours % 24}h${hours % 24 > 1 ? '' : ''}`;
      }
      if (minutes % 60 > 0) {
        timeString += ` ${minutes % 60}m${minutes % 60 > 1 ? '' : ''}`;
      }
      return `${timeString} ago`;
    } else if (hours > 0) {
      let timeString = `${hours}h${hours > 1 ? '' : ''}`;
      if (minutes % 60 > 0) {
        timeString += ` ${minutes % 60}m${minutes % 60 > 1 ? '' : ''}`;
      }
      return `${timeString} ago`;
    } else if (minutes > 0) {
      let timeString = `${minutes}m${minutes > 1 ? '' : ''}`;
      if (seconds % 60 > 0) {
        timeString += ` ${seconds % 60}s${seconds % 60 > 1 ? '' : ''}`;
      }
      return `${timeString} ago`;
    } else if (seconds > 0) {
      return `${seconds}s${seconds > 1 ? '' : ''} ago`;
    } else {
      return 'A moment ago';
    }
  }
};
