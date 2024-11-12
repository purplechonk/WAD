import anime from 'animejs/lib/anime.es.js';

// Helper vars and functions.
function extend(a, b) {
    for (var key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}

function createDOMEl(type, className, content) {
    var el = document.createElement(type);
    el.className = className || '';
    el.innerHTML = content || '';
    return el;
}

function createStyleForDOMEL(el, position, top, left, width, height, color, background, opacity, pointerEvents, zIndex) {
    // This is a helper function for creating the styles for a given element
    el.style.position = position || 'absolute';
    el.style.top = top || '0';
    el.style.left = left || '0';
    el.style.color = color || '#fff';
    el.style.width = width || '100%';
    el.style.height = height || '100%';
    el.style.backgroundColor = background || '#f0f0f0';
    el.style.opacity = opacity || '0';
    el.style.pointerEvents = pointerEvents || 'none';
    el.style.zIndex = zIndex || 0;
}

/**
 * RevealFx class.
 */
function RevealFx(el, options) {
    this.el = el;
    this.revealLayers = [];
    this.options = extend({}, this.options);
    extend(this.options, options);
    this._init();
}

/**
 * RevealFx options.
 */
RevealFx.prototype.options = {
    // If true, then the content will be hidden until it´s "revealed".
    isContentHidden: true,
    // Number of layers to be displayed
    layers: 1,
    // The animation/reveal settings. This can be set initially or passed when calling the reveal method.
    revealSettings: {
        // Animation direction: left right (lr) || right left (rl) || top bottom (tb) || bottom top (bt).
        direction: 'lr',
        // Revealer's background color array.
        bgColors: ['#111'],
        // Animation speed. This is the speed to "cover" and also "uncover" the element (separately, not the total time).
        duration: 500,
        // Animation easing. This is the easing to "cover" and also "uncover" the element.
        easing: 'easeInOutQuint',
        // Percentage-based value representing how much of the area should be left covered.
        coverArea: 0,
        // Milliseconds of delay between layers animation that is used in stagger animation 
        delay: 100,
        // Callback for when the revealer is covering the element (halfway through of the whole animation)
        onHalfway: function (contentEl, revealerEl) { return false; },
        // Callback for when the animation starts (animation start).
        onStart: function (contentEl, revealerEl) { return false; },
        // Callback for when the revealer has completed uncovering (animation end).
        onComplete: function (contentEl, revealerEl) { return false; },
    }
};

/**
 * Init.
 */
RevealFx.prototype._init = function () {
    this._layout();
};

/**
 * Build the necessary structure.
 */
RevealFx.prototype._layout = function () {
    var position = getComputedStyle(this.el).position;
    if (position !== 'fixed' && position !== 'absolute' && position !== 'relative') {
        this.el.style.position = 'relative';
    }
    var heightOfEl = 100;
    var widthOfEl = 100;
    // Content element.
    this.content = createDOMEl('div', 'block-revealer__content', this.el.innerHTML);
    if (this.options.isContentHidden) {
        this.content.style.opacity = 0;
    }
    this.el.innerHTML = '';
    this.el.appendChild(this.content);

    var topOfRevealerElement = 0;
    var leftOfRevalerElement = 0;
    const numberOfLayers = this.options.layers;
    var colorOfBlockLayer = '#111';
    for (var i = 0; i < numberOfLayers; i++) {
        // Revealer element (the one that animates)
        this.revealLayers.push(createDOMEl('div', 'block-revealer__element'));
        if (this.options.revealSettings.bgColors[i])
            colorOfBlockLayer = this.options.revealSettings.bgColors[i];
        else
            colorOfBlockLayer = '#111111';

        if (this.options.revealSettings.direction === 'tb' || this.options.revealSettings.direction === 'bt') {
            var widthOfIndividualBlock = widthOfEl / numberOfLayers;
            createStyleForDOMEL(this.revealLayers[i], 'absolute', '0%', leftOfRevalerElement + '%', widthOfIndividualBlock + '%', '100%', '#fff', colorOfBlockLayer, '0', 'none');
            leftOfRevalerElement = leftOfRevalerElement + widthOfIndividualBlock;
        } else {
            var heightOfIndividualBlock = heightOfEl / numberOfLayers;
            createStyleForDOMEL(this.revealLayers[i], 'absolute', topOfRevealerElement + '%', '0%', '100%', (heightOfIndividualBlock + .5) + '%', '#fff', colorOfBlockLayer, '0', 'none');
            topOfRevealerElement = topOfRevealerElement + heightOfIndividualBlock;
        }

        this.el.classList.add('block-revealer');
        this.el.appendChild(this.revealLayers[i]);
    }
};

/**
 * Gets the revealer element´s transform and transform origin.
 */
RevealFx.prototype._getTransformSettings = function (direction) {
    var origin, origin_2, val;

    switch (direction) {
        case 'lr':
            val = 'scaleY(1)';
            origin = '0 50%';
            origin_2 = '100% 50%';
            break;
        case 'rl':
            val = 'scaleY(1)';
            origin = '100% 50%';
            origin_2 = '0 50%';
            break;
        case 'tb':
            val = 'scaleX(1)';
            origin = '50% 0';
            origin_2 = '50% 100%';
            break;
        case 'bt':
            val = 'scaleX(1)';
            origin = '50% 100%';
            origin_2 = '50% 0';
            break;
        default:
            val = 'scaleY(1)';
            origin = '0 50%';
            origin_2 = '100% 50%';
            break;
    }

    return {
        // transform value.
        val: val,
        origin: { initial: origin, halfway: origin_2 },
    };
};

/**
 * Reveal animation. If revealSettings is passed, then it will overwrite the options.revealSettings.
 */
RevealFx.prototype.reveal = function (revealSettings) {
    if (this.isAnimating) {
        return false;
    }
    this.isAnimating = true;

    var defaults = {
            duration: 500,
            easing: 'easeInOutQuint',
            delay: 100,
            bgColors: ['#111111'],
            direction: 'lr',
            coverArea: 0,
        },
        revealSettings = revealSettings || this.options.revealSettings,
        direction = revealSettings.direction || defaults.direction,
        delay = revealSettings.delay || defaults.delay,
        transformSettings = this._getTransformSettings(direction);

    for (var i = 0; i < this.revealLayers.length; i++) {
        this.revealLayers[i].style.WebkitTransform = this.revealLayers[i].style.transform = transformSettings.val;
        this.revealLayers[i].style.WebkitTransformOrigin = this.revealLayers[i].style.transformOrigin = transformSettings.origin.initial;
        this.revealLayers[i].style.opacity = 1;
        if (revealSettings.bgColors[i])
            this.revealLayers[i].style.backgroundColor = revealSettings.bgColors[i];
        else
            this.revealLayers[i].style.backgroundColor = defaults.bgColors[0];
    }

    var self = this,
        animationSettings_2 = {
            targets: self.revealLayers,
            delay: anime.stagger(parseInt(delay)),
            complete: function (anim) {
                if (typeof revealSettings.onComplete === 'function') {
                    revealSettings.onComplete(self.content, self.revealLayers);
                }
                self.isAnimating = false;
            }
        },
        animationSettings = {
            targets: self.revealLayers,
            delay: anime.stagger(parseInt(delay)),
            complete: function () {
                for (var i = 0; i < self.revealLayers.length; i++) {
                    self.revealLayers[i].style.WebkitTransformOrigin = self.revealLayers[i].style.transformOrigin = transformSettings.origin.halfway;
                }
                if (typeof revealSettings.onHalfway === 'function') {
                    revealSettings.onHalfway(self.content, self.revealLayers);
                }
                anime(animationSettings_2);
            }
        };

    animationSettings.duration = animationSettings_2.duration = revealSettings.duration || defaults.duration;
    animationSettings.easing = animationSettings_2.easing = revealSettings.easing || defaults.easing;

    var coverArea = revealSettings.coverArea || defaults.coverArea;
    if (direction === 'lr' || direction === 'rl') {
        animationSettings.scaleX = [0, 1];
        animationSettings_2.scaleX = [1, coverArea / 100];
    } else {
        animationSettings.scaleY = [0, 1];
        animationSettings_2.scaleY = [1, coverArea / 100];
    }

    if (typeof revealSettings.onStart === 'function') {
        revealSettings.onStart(self.content, self.revealLayers);
    }
    anime(animationSettings);
};

// Export RevealFx as an ES module
export { RevealFx, anime };