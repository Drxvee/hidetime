/**
 * @name HideTime
 * @author Drxve
 * @description Protects your privacy by removing or replacing timestamps to relative.
 * @source https://github.com/Drxvee/hidetime/blob/main/HideTime.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Drxvee/hidetime/refs/heads/main/HideTime.plugin.js
 * @version 1.0.2
 */

const DEFAULT_SETTINGS = {
  key: "F10", // Default keybind, check plugins settings to change this
};

class HideTime {
  constructor(meta) {
    this.enabled = false;
    this.keyDownHandler = null;
    this.mutationObserver = null;
    this.updateInterval = null;
    this.settings = { ...DEFAULT_SETTINGS, ...BdApi.Data.load("HideTime", "settings") };
  }

  start() {
    this.keyDownHandler = (event) => {
      if (event.key === this.settings.key) {
        this.enabled = !this.enabled;
        this.toggleTimeFormat();
      }
    };
    document.addEventListener('keydown', this.keyDownHandler);

    this.mutationObserver = new MutationObserver(() => {
      this.toggleTimeFormat();
    });
    this.mutationObserver.observe(document.body, { childList: true, subtree: true });

    this.updateInterval = setInterval(() => this.toggleTimeFormat(), 1000);
  }

  stop() {
    document.removeEventListener('keydown', this.keyDownHandler);
    this.mutationObserver?.disconnect();
    clearInterval(this.updateInterval);
  }

  toggleTimeFormat() {
    const timeElements = document.querySelectorAll('time');
    const separators = document.querySelectorAll('[role="separator"]');

    timeElements.forEach((timeElement) => {
      const datetime = timeElement.getAttribute('datetime');
      timeElement.textContent = this.enabled ? this.getRelativeTime(datetime) : timeElement.getAttribute('aria-label');
    });

    separators.forEach((separator) => {
      separator.style.display = this.enabled ? 'none' : '';
    });
  }

  getRelativeTime(datetime) {
    const timestamp = new Date(datetime).getTime();
    const now = new Date().getTime();
    const diff = now - timestamp;

    const units = [
      { label: 'd', value: 86400000 },
      { label: 'h', value: 3600000 },
      { label: 'm', value: 60000 },
      { label: 's', value: 1000 },
    ];

    let remaining = diff;
    let result = '';

    for (const unit of units) {
      const count = Math.floor(remaining / unit.value);
      if (count > 0) {
        result += `${count}${unit.label} `;
        remaining %= unit.value;
      }
    }

    return result ? `${result.trim()} ago` : 'A moment ago';
  }

  getSettingsPanel() {
    const settingsPanel = document.createElement("div");
    settingsPanel.id = "HideTime-settings";

    const keybindSetting = document.createElement("div");
    keybindSetting.classList.add("setting");

    const keybindLabel = document.createElement("span");
    keybindLabel.textContent = "Keybind";

    const keybindInput = document.createElement("input");
    keybindInput.type = "text";
    keybindInput.value = this.settings.key;
    keybindInput.addEventListener("input", (event) => {
      const newKey = event.target.value.toUpperCase();
      if (newKey) {
        this.settings.key = newKey;
        BdApi.Data.save("HideTime", "settings", this.settings);
      }
    });

    keybindSetting.append(keybindLabel, keybindInput);
    settingsPanel.append(keybindSetting);

    return settingsPanel;
  }
}

module.exports = HideTime;
