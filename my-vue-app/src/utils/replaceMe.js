export default class ReplaceMe {
    constructor(element, options = {}) {
      const defaultOptions = {
        animation: 'animated fadeIn',
        speed: 2000,
        separator: ',',
        hoverStop: false,
        clickChange: false,
        loopCount: 'infinite',
        autoRun: true,
        onInit: () => {},
        onChange: () => {},
        onComplete: () => {},
      };
  
      this.options = { ...defaultOptions, ...options };
      if (!element) throw new Error('ReplaceMe: "element" parameter is required');
      this.element = typeof element === 'string' ? document.querySelector(element) : element;
      this.init();
    }
  
    init() {
      this.options.onInit();
      this.words = this.element.innerHTML.split(this.options.separator);
      this.count = this.words.length;
      this.position = 0;
      this.loopCount = 0;
      this.running = false;
  
      this.bindEvents();
      if (this.options.autoRun) this.start();
    }
  
    bindEvents() {
      if (this.options.hoverStop) {
        this.element.addEventListener('mouseover', () => this.pause());
        this.element.addEventListener('mouseout', () => this.start());
      }
      if (this.options.clickChange) {
        this.element.addEventListener('click', () => this.change());
      }
    }
  
    changeWord(word) {
      this.element.innerHTML = `<span class="${this.options.animation}" style="display:inline-block;">${word}</span>`;
    }
  
    change() {
      if (this.position >= this.count) {
        this.position = 0;
        this.loopCount++;
        if (this.loopCount >= this.options.loopCount) {
          this.stop();
          return;
        }
      }
      this.changeWord(this.words[this.position]);
      this.position++;
      this.options.onChange();
    }
  
    start() {
      if (!this.running) {
        this.running = true;
        this.change();
        this.interval = setInterval(() => this.change(), this.options.speed);
      }
    }
  
    pause() {
      clearInterval(this.interval);
      this.running = false;
    }
  
    stop() {
      this.pause();
      this.options.onComplete();
    }
  }
  