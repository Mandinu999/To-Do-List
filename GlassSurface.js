class GlassSurface extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.uniqueId = Math.random().toString(36).substr(2, 9);
    this.filterId = `glass-filter-${this.uniqueId}`;
    this.redGradId = `red-grad-${this.uniqueId}`;
    this.blueGradId = `blue-grad-${this.uniqueId}`;
    this.svgSupported = this.supportsSVGFilters();
  }
  
  supportsSVGFilters() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) return false;
    // Assume supported for modern chromium
    return true;
  }

  connectedCallback() {
    if (this.svgSupported) {
      this.injectFilterToLightDOM();
    }
    this.render();
    this.setupObserver();
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => this.updateDisplacementMap());
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    const filterEl = document.getElementById(`svg-container-${this.uniqueId}`);
    if (filterEl) filterEl.remove();
  }

  static get observedAttributes() {
    return [
      'width', 'height', 'border-radius', 'border-width', 'brightness',
      'opacity', 'blur', 'displace', 'background-opacity', 'saturation',
      'distortion-scale', 'red-offset', 'green-offset', 'blue-offset',
      'x-channel', 'y-channel', 'mix-blend-mode'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.updateDisplacementMap();
    }
  }

  numAttr(name, def) {
    const val = this.getAttribute(name);
    return val !== null ? parseFloat(val) : def;
  }

  strAttr(name, def) {
    return this.getAttribute(name) || def;
  }

  injectFilterToLightDOM() {
    if (!document.getElementById(`svg-container-${this.uniqueId}`)) {
      const container = document.createElement('div');
      container.id = `svg-container-${this.uniqueId}`;
      container.style.position = 'absolute';
      container.style.width = '0';
      container.style.height = '0';
      container.style.pointerEvents = 'none';
      container.style.overflow = 'hidden';
      
      container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="${this.filterId}" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
              <feImage class="fe-image-${this.uniqueId}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
              
              <feDisplacementMap class="red-channel-${this.uniqueId}" in="SourceGraphic" in2="map" id="redchannel" result="dispRed" />
              <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
              
              <feDisplacementMap class="green-channel-${this.uniqueId}" in="SourceGraphic" in2="map" id="greenchannel" result="dispGreen" />
              <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
              
              <feDisplacementMap class="blue-channel-${this.uniqueId}" in="SourceGraphic" in2="map" id="bluechannel" result="dispBlue" />
              <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
              
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" result="output" />
              <feGaussianBlur class="gaussian-blur-${this.uniqueId}" in="output" stdDeviation="0.7" />
            </filter>
          </defs>
        </svg>
      `;
      document.body.appendChild(container);
    }
  }

  generateDisplacementMap() {
    const container = this.shadowRoot.querySelector('.glass-surface');
    const rect = container?.getBoundingClientRect();
    const actualWidth = Math.max(rect?.width || 400, 1);
    const actualHeight = Math.max(rect?.height || 200, 1);
    
    const borderWidth = this.numAttr('border-width', 0.07);
    const borderRadius = this.numAttr('border-radius', 20);
    const brightness = this.numAttr('brightness', 50);
    const opacity = this.numAttr('opacity', 0.93);
    const blur = this.numAttr('blur', 11);
    const mixBlendMode = this.strAttr('mix-blend-mode', 'difference');

    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${this.redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${this.blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${this.redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${this.blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    // Must be data URI
    return `data:image/svg+xml,${encodeURIComponent(svgContent.trim())}`;
  }

  updateDisplacementMap() {
    if (!this.svgSupported) return;

    const feImage = document.querySelector(`.fe-image-${this.uniqueId}`);
    if (feImage) {
      feImage.setAttribute('href', this.generateDisplacementMap());
    }

    const distortionScale = this.numAttr('distortion-scale', -180);
    const xChannel = this.strAttr('x-channel', 'R');
    const yChannel = this.strAttr('y-channel', 'G');
    const displace = this.numAttr('displace', 0);
    
    const setChannel = (selector, offset) => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute('scale', (distortionScale + offset).toString());
        el.setAttribute('xChannelSelector', xChannel);
        el.setAttribute('yChannelSelector', yChannel);
      }
    };

    setChannel(`.red-channel-${this.uniqueId}`, this.numAttr('red-offset', 0));
    setChannel(`.green-channel-${this.uniqueId}`, this.numAttr('green-offset', 10));
    setChannel(`.blue-channel-${this.uniqueId}`, this.numAttr('blue-offset', 20));

    const gaussianBlur = document.querySelector(`.gaussian-blur-${this.uniqueId}`);
    if (gaussianBlur) {
      gaussianBlur.setAttribute('stdDeviation', displace.toString());
    }
    
    this.updateContainerStyles();
  }

  updateContainerStyles() {
    const container = this.shadowRoot.querySelector('.glass-surface');
    if (!container) return;

    const width = this.strAttr('width', '100%');
    const height = this.strAttr('height', '100%');
    const borderRadius = this.numAttr('border-radius', 20);
    const backgroundOpacity = this.numAttr('background-opacity', 0);
    const saturation = this.numAttr('saturation', 1);
    
    this.style.width = !isNaN(parseFloat(width)) && isFinite(width) ? width + 'px' : width;
    this.style.height = !isNaN(parseFloat(height)) && isFinite(height) ? height + 'px' : height;
    
    container.style.borderRadius = borderRadius + 'px';
    container.style.setProperty('--glass-frost', backgroundOpacity);
    container.style.setProperty('--glass-saturation', saturation);
    container.style.setProperty('--filter-id', `url(#${this.filterId})`);
  }

  setupObserver() {
    const container = this.shadowRoot.querySelector('.glass-surface');
    if (!container) return;
    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this.updateDisplacementMap());
    });
    this.resizeObserver.observe(container);
  }

  render() {
    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          /* Ensure the host size maps to its parent's constraints */
          min-width: 0;
          min-height: 0;
        }

        .glass-surface {
          position: relative;
          display: flex;
          flex-direction: column;
          flex: 1;
          width: 100%;
          height: 100%;
          overflow: hidden;
          transition: opacity 0.26s ease-out;
          min-width: 0;
          min-height: 0;
        }

        .glass-surface__content {
          display: flex;
          flex-direction: column;
          flex: 1;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          position: relative;
          z-index: 1;
          min-width: 0;
          min-height: 0;
        }

        .glass-surface--svg {
          background: rgba(0, 0, 0, var(--glass-frost, 0));
          backdrop-filter: var(--filter-id, none) saturate(var(--glass-saturation, 1));
          -webkit-backdrop-filter: var(--filter-id, none) saturate(var(--glass-saturation, 1));
          box-shadow:
            inset 0 0 2px 1px rgba(255, 255, 255, 0.1),
            inset 0 0 10px 4px rgba(255, 255, 255, 0.05),
            0px 8px 24px rgba(0, 0, 0, 0.2);
        }

        .glass-surface--fallback {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px) saturate(1.5);
          -webkit-backdrop-filter: blur(16px) saturate(1.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
      </style>
      <div class="glass-surface \${this.svgSupported ? 'glass-surface--svg' : 'glass-surface--fallback'}">
        <div class="glass-surface__content">
          <slot></slot>
        </div>
      </div>
    \`;
  }
}

customElements.define('glass-surface', GlassSurface);
