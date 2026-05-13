// Bundle automatically generated on 2026-05-13 17:48:54

// ---------------- logger.js ---------------
class WexaLogger {
    static #logLevel = 20;
    static getLogLevel() {
        return this.#logLevel;
    }
    static setLogLevel(level) {
        if (typeof level !== 'number' || level < 0 || level > 50) {
            console.warn('[WexaWarning] Invalid log level. Must be between 0 and 50.');
            return;
        }
        this.#logLevel = level;
    }
    static debug(msg) {
        if (this.#logLevel <= 10) console.info(`[WexaDebug] ${msg}`);
    }
    static info(msg) {
        if (this.#logLevel <= 20) console.info(`[WexaInfo] ${msg}`);
    }
    static warn(msg) {
        if (this.#logLevel <= 30) console.warn(`[WexaWarning] ${msg}`);
    }
    static error(msg, err) {
        if (this.#logLevel <= 40) console.error(`[WexaError] ${msg}`, err || '');
    }
    static critical(msg, err) {
        console.error(`[WexaCritical] ${msg}`, err || '');
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.WexaLogger = WexaLogger;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- transport/request.js ---------------
class RequestManager {
    // FIELDS
    // The declaration outside the constructor and the '#' symbol notify a private attribute.
    #protocol;
    #port;
    #url;
    #status;
    maxFileSize;
    // CONSTRUCTOR
    constructor() {
        this.#protocol = window.location.protocol;
        this.#port = window.location.port;
        this.#url = this.#protocol + "//" + window.location.hostname + ":" + this.#port + "/";
        this.#status = null;
        this.maxFileSize = 0;  // No upload file size limit
    }
    // ----------------------------------------------------------------------
    // GETTERS
    // ----------------------------------------------------------------------
    get protocol() {
        return this.#protocol;
    }
    // ----------------------------------------------------------------------
    get port() {
        return this.#port;
    }
    // ----------------------------------------------------------------------
    get request_url() {
        return this.#url;
    }
    // ----------------------------------------------------------------------
    get status() {
        return this.#status;
    }
    // ----------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------
    async send_get_request(uri = "", is_json_response = false) {
        const complete_url = this.request_url + uri;
        let request_response_data = null;
        // send request to the server
        await fetch(complete_url)
            // then gets content of the server response
            .then(async response =>  {
                // get the status response and check if there is an error
                this.#status = response.status;
                // get the content of the server response and parse them if it's a json format
                if (is_json_response) {
                    const text = await response.text();
                    if (text.trim() === '') {
                        request_response_data = {};   // JSON vide → objet vide
                    } else {
                        try {
                            request_response_data = JSON.parse(text);
                        } catch (error) {
                            console.error('Failed to parse JSON response', error);
                            request_response_data = {
                                status: response.status,
                                error: 'Failed to parse JSON.',
                                raw: text
                            };
                        }
                    }
                } else {
                    request_response_data = await response.text();
                }
            })
            // handle error
            .catch(error => {
                this.#status = error.status;
                request_response_data = error;
            });
        return request_response_data;
    }
    // ----------------------------------------------------------------------
    async send_post_request(post_parameters, accept_type = "application/json", uri = "") {
		const complete_url = this.request_url + uri;
        let request_response_data = null;
        // build request header and body depending on parameter passed to the method
        post_parameters = JSON.stringify(post_parameters);
        let request_header = {
            'Accept': accept_type,
            'Content-Type': "application/json; charset=utf-8",
            'Content-Length': post_parameters.length.toString()
        }
        // send request to the server
        await fetch(complete_url, {
            method: "POST",
            headers: request_header,
            body: post_parameters
        })
            // then gets content of the server response
            .then(async response =>  {
                // get the status response and check if there is an error
                this.#status = response.status;
                if (accept_type.includes("application/json")) {
                    const text = await response.text();
                    if (text.trim() === '') {
                        request_response_data = {};
                    } else {
                        try {
                            request_response_data = JSON.parse(text);
                        } catch (error) {
                            if (!response.headers.get('Content-Type')?.includes('application/json')) {
                                // No backend available: ignore silently
                                return {};
                            } else {
                                console.error("Failed to parse JSON response: " + error);
                                request_response_data = {
                                    status: response.status,
                                    error: "Failed to parse JSON. See error details in the newly opened tab.",
                                    html: text
                                };
                                this.openErrorTab(text);
                            }
                        }
                    }
                }
                // Handle HTML responses (e.g., error pages)
                else if (accept_type.includes("text/html")) {
                    // If response is HTML, treat it as a failed request (500 error or other)
                    const responseText = await response.text();
                    request_response_data = {
                        status: response.status,
                        error: "Received HTML instead of JSON. See error details in the newly opened tab.",
                        html: responseText
                    };
                    // Open a new tab to display the HTML error content
                    this.openErrorTab(responseText);
                }
                else {
                    request_response_data = await response.blob();
                }
            })
            // handle error
            .catch(error => {
                this.#status = error.status;
                request_response_data = error;
            })
        ;
        return request_response_data;
    }
    // ----------------------------------------------------------------------
    openErrorTab(responseText) {
        // Optionally open a new tab to display the HTML error content
        const errorTab = window.open();
        if (errorTab) {
            errorTab.document.open();
            errorTab.document.write(responseText);
            errorTab.document.close();
        } else {
            console.error("Failed to open a new tab for the error page.");
        }
    }
    // ----------------------------------------------------------------------
    async upload_file(input, accept_type = "application/json", token = "", uri = "") {
        let response_data = null;
        const complete_url = this.request_url + uri;
        this.#status = 400;
        // Exit the function if no file is selected
        if (!input || !input.files || !input.files[0]) {
            console.warn("No file selected for upload.");
            // Return a JSON object with status 400 and an error message
            return { error: "No file or empty file selected for upload." };
        }
        console.debug("Defined size limit: ", this.maxFileSize);
        console.debug("File size to upload: ", input.files[0].size);
        // Exit the function if size limit
        if (this.maxFileSize !== 0 && input.files[0].size > this.maxFileSize) {
            console.error(`File size exceeds maximum of ${this.maxFileSize} bytes.`);
            // Return a JSON object with status 400 and an error message
            return { error: "File size exceeds maximum allowed length." };
        }
        // Create a new File instance, with the sanitized filename (no diacritics)
        let sanitizedFileName = input.files[0].name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        let sanitizedFile = new File([input.files[0]], sanitizedFileName, {
            type: input.files[0].type,
            lastModified: input.files[0].lastModified,
        });
        // Format file to upload to the server
        let data = new FormData();
        data.append('file', sanitizedFile);
        // Send request to the back-end and wait for the response (response in json)
        await fetch(complete_url, {
            method: 'POST',
            headers: {
                'Accept': accept_type,
                'X-Auth-Token': 'Bearer ' + token
            },
            body: data
        })
        // get the response and update the current status code
        .then(async response => {
            console.debug(" ... server answer: ", response);
            this.#status = response.status;
            // Check if the status is not 200 and there is no error in the response
            if (response.status !== 200 && !response.error) {
                // Return a JSON object with statusText to indicate the error
                response_data = { "error": response.statusText };
            } else {
                // If status is 200 or there is an error, return the JSON response
                response_data = await response.json();
            }
        })
        // handle error
        .catch(error => {
            console.error(" ... server error: ", error);
            this.#status = error.status;
            response_data = error;
        })
        return response_data;
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.RequestManager = RequestManager;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- transport/base_manager.js ---------------
'use strict';
class BaseManager {
    // ----------------------------------------------------------------------
    // Private members shared by all classes
    // ----------------------------------------------------------------------
    // An instance of the RequestManager class responsible for managing HTTP requests.
    _requestManager;
    // A string representing the current URL path, extracted from the window location.
    _uri;
    // ----------------------------------------------------------------------
    // Constructor
    // ----------------------------------------------------------------------
    constructor() {
        this._requestManager = new RequestManager();
        let url = new URL(window.location.href);
        this._uri = url.pathname.substring(1);
        this._dialog = new DialogManager();
    }
    // ----------------------------------------------------------------------
    _showActionResult(error = "", info = "", reload = true) {
        if (this._requestManager.status !== 200) {
            WexaLogger.error(`HTTP error ${this._requestManager.status}: ${error}`);
            this._showDialog('error_dialog', `Erreur ${this._requestManager.status} : ${error}`);
        } else {
            if (info) {
                WexaLogger.info(info);
                this._showDialog('info_dialog', info);
            }
            if (reload) {
                window.location.reload();
            }
        }
    }
    // ----------------------------------------------------------------------
    submitForm(inputName, inputValue) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.style.display = 'none';
            const input = document.createElement('input');
            input.name = inputName;
            input.value = inputValue;
            input.type = 'hidden';
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
            // Clean the DOM
            document.body.removeChild(form);
    }
    // ----------------------------------------------------------------------
    async postEvents(events) {
        let response;
        let respError= "";
        let respInfo = "";
        try {
            response = await this._requestManager.send_post_request(
                events,
                'application/json',
                this._uri
            );
            WexaLogger.debug(`HTTP status ${this._requestManager.status}`);
            // If there's a message in the response
            respError = response.error || "";
            respInfo = response.info || "";
        } catch (error) {
            // Do not handle any request or network error: it's probably a standard server, not a WhakerPy one!
            // respError = error.toString();
            // No backend available: ignore silently
            return;
        }
        // Server replied: process normally
        if (respError || respInfo) {
            this._showActionResult(respError, respInfo, true);
            return;
        }
        // No server response: ignore silently
        if (!response) {
            return;
        }
        // Return the response if no message sent
        return response;
    }
    // ----------------------------------------------------------------------
    _showDialog = (dialogId, message) => {
        let dlg = document.getElementById(dialogId);
        if (dlg != null) {
            dlg.innerHTML = `<p>${message}</p>`;
            this._dialog.open(dialogId);
        } else {
            alert(message);
        }
    }
    // ----------------------------------------------------------------------
    _hideDialog = (dialogId) => {
        let dlg = document.getElementById(dialogId);
        if (dlg != null) {
            dlg.innerHTML = ``;
            this._dialog.close(dialogId);
        } else {
            WexaLogger.warn(`No such dialog ${dialogId}`);
        }
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.BaseManager = BaseManager;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/slides_data.js ---------------
'use strict';
class SlidesData {
    constructor(slides) {
        this.slides = Array.isArray(slides) ? slides : [];
        this.currentIndex = 1;   // 1-based
        this.currentStep  = 0;
        this.previousIndex = 0;  // 0 = no previous (initial state)
        this.mode = 'presentation';
        this.autoPlay = false;
    }
    get count() {
        return this.slides.length;
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SlidesData = SlidesData;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/navigation_logic.js ---------------
'use strict';
class NavigationLogic {
    constructor(data) {
        this._data = data;
        this._onNavigate = null;
    }
    set onNavigate(fn) {
        this._onNavigate = typeof fn === 'function' ? fn : null;
    }
    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    next() {
        const { currentIndex, currentStep } = this._data;
        const maxStep = this._incrementalCount(currentIndex);
        if (currentIndex === this._data.count && currentStep >= maxStep) {
            return;
        }
        if (currentStep >= maxStep) {
            this._navigateTo(currentIndex + 1, 0);
        } else {
            this._navigateTo(currentIndex, currentStep + 1);
        }
    }
    prev() {
        const { currentIndex, currentStep } = this._data;
        if (currentIndex === 1 && currentStep === 0) {
            return;
        }
        if (currentStep === 0) {
            const prevIdx = currentIndex - 1;
            this._navigateTo(prevIdx, this._incrementalCount(prevIdx));
        } else {
            this._navigateTo(currentIndex, currentStep - 1);
        }
    }
    goTo(index, step = 0) {
        this._navigateTo(index, step);
    }
    goStart() {
        this._navigateTo(1, 0);
    }
    goEnd() {
        const last = this._data.count;
        this._navigateTo(last, this._incrementalCount(last));
    }
    toggleContent() {
        const slide = this._data.slides[this._data.currentIndex - 1];
        if (!(slide instanceof HTMLElement)) {
            return;
        }
        const video = slide.querySelector('video');
        if (!(video instanceof HTMLVideoElement)) {
            return;
        }
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
        }
    }
    updateFromHash(hash) {
        if (typeof hash !== 'string' || hash === '' || hash[0] !== '#') {
            this._setPosition(1, 0);
            return;
        }
        const parts = hash.substring(1).split('.');
        const idx = parseInt(parts[0], 10);
        const stp = parts.length > 1 ? parseInt(parts[1], 10) : 0;
        this._setPosition(
            Number.isNaN(idx) ? 1 : idx,
            Number.isNaN(stp) ? 0 : stp
        );
    }
    // -----------------------------------------------------------------------
    // Private
    // -----------------------------------------------------------------------
    _navigateTo(index, step) {
        const changed = this._setPosition(index, step);
        if (changed) {
            window.location.hash = `#${this._data.currentIndex}.${this._data.currentStep}`;
        }
    }
    _setPosition(index, step) {
        const clamped = this._clampIndex(index);
        const clampedStep = this._clampStep(clamped, step);
        const isInitial = this._data.previousIndex === 0;
        const unchanged = clamped === this._data.currentIndex
                       && clampedStep === this._data.currentStep;
        if (!isInitial && unchanged) {
            return false;
        }
        // Pause video on the slide we're leaving
        const prevSlide = this._data.slides[this._data.currentIndex - 1];
        if (prevSlide instanceof HTMLElement) {
            const v = prevSlide.querySelector('video');
            if (v instanceof HTMLVideoElement) {
                v.pause();
            }
        }
        this._data.previousIndex = this._data.currentIndex;
        this._data.currentIndex  = clamped;
        this._data.currentStep   = clampedStep;
        // Autoplay video on the slide we're entering
        if (this._data.autoPlay) {
            const currSlide = this._data.slides[clamped - 1];
            if (currSlide instanceof HTMLElement) {
                const v = currSlide.querySelector('video');
                if (v instanceof HTMLVideoElement) {
                    v.play();
                }
            }
        }
        if (this._onNavigate !== null) {
            this._onNavigate(this._data);
        }
        return true;
    }
    _incrementalCount(index) {
        const slide = this._data.slides[this._clampIndex(index) - 1];
        if (!(slide instanceof HTMLElement)) {
            return 0;
        }
        return slide.querySelectorAll('.incremental > *').length;
    }
    _clampIndex(index) {
        const n = this._data.count;
        if (n === 0) {
            return 1;
        }
        return Math.max(1, Math.min(index, n));
    }
    _clampStep(index, step) {
        return Math.max(0, Math.min(step, this._incrementalCount(index)));
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.NavigationLogic = NavigationLogic;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/viewmode_logic.js ---------------
'use strict';
class ViewModeLogic {
    static MODES = {
        PRESENTATION: 'presentation',
        OVERVIEW:     'overview',
    };
    static DEFAULT = 'presentation';
    constructor(data) {
        this._data = data;
        this._onModeChange = null;
    }
    set onModeChange(fn) {
        this._onModeChange = typeof fn === 'function' ? fn : null;
    }
    get current() {
        return this._data.mode;
    }
    set(mode) {
        const valid = Object.values(ViewModeLogic.MODES);
        if (!valid.includes(mode)) {
            return;
        }
        this._data.mode = mode;
        if (this._onModeChange !== null) {
            this._onModeChange(this._data);
        }
    }
    toggle() {
        const next = this._data.mode === ViewModeLogic.MODES.OVERVIEW
            ? ViewModeLogic.MODES.PRESENTATION
            : ViewModeLogic.MODES.OVERVIEW;
        this._data.mode = next;
        if (this._onModeChange !== null) {
            this._onModeChange(this._data);
        }
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.ViewModeLogic = ViewModeLogic;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/visibility.js ---------------
'use strict';
class SlidesVisibilityController {
    constructor(element) {
        this._element = element instanceof HTMLElement ? element : null;
    }
    show() {
        if (this._element instanceof HTMLElement) {
            this._element.style.display = 'block';
        }
    }
    hide() {
        if (this._element instanceof HTMLElement) {
            this._element.style.display = 'none';
        }
    }
    toggle() {
        if (!(this._element instanceof HTMLElement)) {
            return;
        }
        // Use getComputedStyle to handle elements visible via CSS rules (not inline style).
        const computed = window.getComputedStyle(this._element).display;
        this._element.style.display = computed === 'none' ? 'block' : 'none';
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SlidesVisibilityController = SlidesVisibilityController;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/visibility_manager.js ---------------
'use strict';
class SlidesVisibilityManager {
    constructor(elementsMap = {}) {
        this._controllers = {};
        const names = Object.keys(elementsMap);
        for (const name of names) {
            const element = elementsMap[name];
            this._controllers[name] = new SlidesVisibilityController(element);
        }
    }
    show(name) {
        const controller = this._controllers[name];
        if (controller instanceof SlidesVisibilityController) {
            controller.show();
        }
    }
    hide(name) {
        const controller = this._controllers[name];
        if (controller instanceof SlidesVisibilityController) {
            controller.hide();
        }
    }
    toggle(name) {
        const controller = this._controllers[name];
        if (controller instanceof SlidesVisibilityController) {
            controller.toggle();
        }
    }
    showAll() {
        const names = Object.keys(this._controllers);
        for (const name of names) {
            this._controllers[name].show();
        }
    }
    hideAll() {
        const names = Object.keys(this._controllers);
        for (const name of names) {
            this._controllers[name].hide();
        }
    }
    getNames() {
        return Object.keys(this._controllers);
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SlidesVisibilityManager = SlidesVisibilityManager;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/focus.js ---------------
'use strict';
class SlidesFocusController {
    constructor(options = {}) {
        const defaultSelector = [
            'a[href]',
            'button',
            'input',
            'select',
            'textarea',
            'details',
            'summary',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]',
            'video[controls]',
            'audio[controls]'
        ].join(', ');
        this._focusableSelector = typeof options.focusableSelector === 'string'
            ? options.focusableSelector
            : defaultSelector;
    }
    updateFocus(slides, activeIndex) {
        if (!Array.isArray(slides) || slides.length === 0) {
            console.warn("Update focus not available. No slides found.");
            return;
        }
        let safeIndex = activeIndex;
        if (safeIndex < 1) {
            safeIndex = 1;
        }
        if (safeIndex > slides.length) {
            safeIndex = slides.length;
        }
        const activeSlide = slides[safeIndex - 1];
        slides.forEach((slide) => {
            const isActive = slide === activeSlide;
            const tabIndexValue = isActive === true ? 0 : -1;
            this._setTabIndexForSlide(slide, tabIndexValue);
        });
    }
    // -----------------------------------------------------------------------
    // Private utilities
    // -----------------------------------------------------------------------
    _setTabIndexForSlide(slide, tabIndexValue) {
        if (!(slide instanceof HTMLElement)) {
            return;
        }
        const elements = this._getFocusableElements(slide);
        const valueString = String(tabIndexValue);
        elements.forEach((element) => {
            const disabled = this._isDisabled(element);
            if (disabled === true) {
                return;
            }
            element.setAttribute('tabindex', valueString);
        });
    }
    _getFocusableElements(slide) {
        if (!(slide instanceof HTMLElement)) {
            return [];
        }
        const nodeList = slide.querySelectorAll(this._focusableSelector);
        return Array.from(nodeList);
    }
    _isDisabled(element) {
        if (!(element instanceof HTMLElement)) {
            return true;
        }
        const hasDisabledAttribute = element.hasAttribute('disabled');
        if (hasDisabledAttribute === true) {
            return true;
        }
        const ariaDisabled = element.getAttribute('aria-disabled');
        if (ariaDisabled !== null && ariaDisabled.toLowerCase() === 'true') {
            return true;
        }
        return false;
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SlidesFocusController = SlidesFocusController;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/fullscreen.js ---------------
'use strict';
class SlidesFullscreenController {
    constructor(target = null) {
        const defaultTarget = typeof document !== 'undefined'
            ? document.documentElement
            : null;
        this._target = target instanceof HTMLElement ? target : defaultTarget;
    }
    enter() {
        if (this._target === null) {
            return;
        }
        const request = this._target.requestFullscreen
            || this._target.requestFullScreen
            || this._target.mozRequestFullScreen
            || this._target.webkitRequestFullScreen
            || null;
        if (typeof request === 'function') {
            request.call(this._target);
        }
    }
    exit() {
        if (typeof document === 'undefined') {
            return;
        }
        const exitMethod = document.exitFullscreen
            || document.cancelFullScreen
            || document.mozCancelFullScreen
            || document.webkitCancelFullScreen
            || null;
        if (typeof exitMethod === 'function') {
            exitMethod.call(document);
        }
    }
    toggle() {
        if (typeof document === 'undefined') {
            return;
        }
        const activeElement = document.fullscreenElement
            || document.mozFullScreenElement
            || document.webkitFullscreenElement
            || null;
        if (activeElement === null) {
            this.enter();
        } else {
            this.exit();
        }
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SlidesFullscreenController = SlidesFullscreenController;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/presentation_view.js ---------------
'use strict';
class PresentationView {
    constructor(slides, progressBar = null, controlsElement = null, controlsViewElement = null) {
        this._slides       = Array.isArray(slides) ? slides : [];
        this._progressBar  = progressBar instanceof HTMLElement ? progressBar : null;
        this._controls     = controlsElement instanceof HTMLElement ? controlsElement : null;
        this._controlsView = controlsViewElement instanceof HTMLElement ? controlsViewElement : null;
    }
    // -----------------------------------------------------------------------
    // Called by SlidesAssembler via navLogic.onNavigate
    // -----------------------------------------------------------------------
    render(data) {
        this._renderSlide(data.currentIndex, data.previousIndex);
        this._renderIncremental(data.currentIndex, data.currentStep);
        this._renderProgress(data.currentIndex, data.count);
    }
    // -----------------------------------------------------------------------
    // Called by SlidesAssembler via modeLogic.onModeChange
    // -----------------------------------------------------------------------
    onModeChange(data) {
        // Sync body class
        const allModes = ['presentation', 'overview'];
        allModes.forEach(m => document.body.classList.remove(`${m}-view`));
        document.body.classList.add(`${data.mode}-view`);
        if (data.mode === 'presentation') {
            this._showSlides();
        } else {
            this._hideSlides();
        }
        // The view-mode buttons panel visibility mirrors the active mode
        if (this._controlsView instanceof HTMLElement) {
            this._controlsView.classList.toggle('controls-hidden', data.mode !== 'presentation');
        }
    }
    // -----------------------------------------------------------------------
    // Visibility of the controls panel (toggled via keyboard / buttons)
    // -----------------------------------------------------------------------
    renderControls(visible) {
        if (this._controls instanceof HTMLElement) {
            this._controls.classList.toggle('controls-hidden', visible === false);
        }
    }
    // -----------------------------------------------------------------------
    // Private rendering helpers
    // -----------------------------------------------------------------------
    _renderSlide(newIndex, oldIndex) {
        const total = this._slides.length;
        if (oldIndex >= 1 && oldIndex <= total) {
            const prev = this._slides[oldIndex - 1];
            if (prev instanceof HTMLElement) {
                prev.removeAttribute('aria-selected');
            }
        }
        if (newIndex >= 1 && newIndex <= total) {
            const curr = this._slides[newIndex - 1];
            if (curr instanceof HTMLElement) {
                curr.setAttribute('aria-selected', 'true');
            }
        }
    }
    _renderIncremental(index, step) {
        const slide = this._getSlide(index);
        if (slide === null) {
            return;
        }
        // Clear all incremental state on this slide
        slide.querySelectorAll('.incremental').forEach(container => {
            container.removeAttribute('active');
            container.querySelectorAll('*').forEach(item => item.removeAttribute('aria-selected'));
        });
        if (step === 0) {
            return;
        }
        const items = slide.querySelectorAll('.incremental > *');
        if (items.length === 0 || step > items.length) {
            return;
        }
        const target = items[step - 1];
        if (target.parentElement instanceof HTMLElement) {
            target.parentElement.setAttribute('active', 'true');
        }
        target.setAttribute('aria-selected', 'true');
    }
    _renderProgress(currentIndex, count) {
        if (!(this._progressBar instanceof HTMLElement)) {
            return;
        }
        const pct = count <= 1 ? 0 : (currentIndex - 1) * 100 / (count - 1);
        this._progressBar.style.width = `${pct}%`;
    }
    _showSlides() {
        for (const slide of this._slides) {
            slide.style.display = 'block';
        }
    }
    _hideSlides() {
        for (const slide of this._slides) {
            slide.style.display = 'none';
        }
    }
    _getSlide(index) {
        if (index < 1 || index > this._slides.length) {
            return null;
        }
        return this._slides[index - 1];
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.PresentationView = PresentationView;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/overview_view.js ---------------
'use strict';
class OverviewView {
    constructor(slides, panelElement) {
        this._slides = Array.isArray(slides)
            ? slides.map(s => s.cloneNode(true))
            : [];
        this._panel = panelElement instanceof HTMLElement ? panelElement : null;
        if (this._panel !== null) {
            this._panel.style.display = 'none';
        }
    }
    // -----------------------------------------------------------------------
    // Called once during init
    // -----------------------------------------------------------------------
    build() {
        if (this._panel === null) {
            return;
        }
        this._panel.innerHTML = '';
        this._slides.forEach((slide, i) => {
            const index = i + 1;
            const article = document.createElement('article');
            article.className = 'overview-item';
            // Header: slide number
            const header = document.createElement('header');
            header.textContent = String(index);
            article.appendChild(header);
            // Main: cloned slide content (inner HTML only)
            const main = document.createElement('main');
            main.appendChild(
                document.createRange().createContextualFragment(slide.innerHTML)
            );
            article.appendChild(main);
            // Footer: GoTo button
            const footer = document.createElement('footer');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'GoTo';
            btn.addEventListener('click', () => {
                // Navigate to this slide and switch back to presentation
                document.dispatchEvent(new CustomEvent('slides:navigate', {
                    detail: { action: 'goTo', index, step: 0 }
                }));
                document.dispatchEvent(new CustomEvent('slides:viewmode', {
                    detail: { mode: 'presentation' }
                }));
            });
            footer.appendChild(btn);
            article.appendChild(footer);
            this._panel.appendChild(article);
        });
    }
    // -----------------------------------------------------------------------
    // Called by SlidesAssembler via modeLogic.onModeChange
    // -----------------------------------------------------------------------
    onModeChange(data) {
        if (this._panel === null) {
            return;
        }
        this._panel.style.display = data.mode === 'overview' ? 'block' : 'none';
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.OverviewView = OverviewView;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/keyboard_controller.js ---------------
'use strict';
class KeyboardController {
    static SHORTCUTS = [
        { keys: ['ArrowRight', 'ArrowDown', 'PageDown'], label: 'Next slide' },
        { keys: ['ArrowLeft', 'ArrowUp', 'PageUp'],      label: 'Previous slide' },
        { keys: ['Home'],                                 label: 'First slide' },
        { keys: ['End'],                                  label: 'Last slide' },
        { keys: ['h', 'H', '?'],                          label: 'Help' },
        { keys: ['f', 'F'],                               label: 'Fullscreen' },
        { keys: ['o', 'O'],                               label: 'Overview mode' },
        { keys: ['Escape', 's', 'S'],                     label: 'Presentation mode' },
        { keys: ['a', 'A'],                               label: 'Accessibility controls' },
        { keys: ['n', 'N'],                               label: 'Navigation controls' },
        { keys: ['b', 'B'],                               label: 'Progress bar' },
        { keys: ['l', 'L'],                               label: 'Logo' },
    ];
    static SLIDE_KEYS = new Set(KeyboardController.SHORTCUTS.flatMap(s => s.keys));
    constructor() {
        this._boundHandler = this._onKeyDown.bind(this);
    }
    init() {
        document.body.addEventListener('keydown', this._boundHandler, false);
    }
    destroy() {
        document.body.removeEventListener('keydown', this._boundHandler, false);
    }
    // -----------------------------------------------------------------------
    // Private
    // -----------------------------------------------------------------------
    _onKeyDown(event) {
        const key = event.key;
        if (!KeyboardController.SLIDE_KEYS.has(key)) return;
        if (key === 'Enter' || key === ' ')            return;
        if (this._isInteractiveTarget(event.target))   return;
        switch (key) {
            case 'h': case 'H': case '?':
                this._emit('slides:help', { action: 'toggle' });
                return;
            case 'Escape':
            case 's': case 'S':
                this._emit('slides:viewmode', { mode: 'presentation' });
                return;
            case 'o': case 'O':
                this._emit('slides:viewmode', { action: 'toggle' });
                return;
            case 'f': case 'F':
                this._emit('slides:fullscreen', {});
                return;
            case 'a': case 'A':
                this._emit('slides:visibility', { name: 'accessibility', action: 'toggle' });
                return;
            case 'n': case 'N':
                this._emit('slides:visibility', { name: 'controls', action: 'toggle' });
                return;
            case 'b': case 'B':
                this._emit('slides:visibility', { name: 'progress', action: 'toggle' });
                return;
            case 'l': case 'L':
                this._emit('slides:visibility', { name: 'logo', action: 'toggle' });
                return;
            case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
                event.preventDefault();
                this._emit('slides:navigate', { action: 'prev' });
                return;
            case 'ArrowRight': case 'ArrowDown': case 'PageDown':
                event.preventDefault();
                this._emit('slides:navigate', { action: 'next' });
                return;
            case 'Home':
                event.preventDefault();
                this._emit('slides:navigate', { action: 'goStart' });
                return;
            case 'End':
                event.preventDefault();
                this._emit('slides:navigate', { action: 'goEnd' });
                return;
        }
    }
    _emit(type, detail) {
        document.dispatchEvent(new CustomEvent(type, { detail }));
    }
    _isInteractiveTarget(target) {
        if (!(target instanceof HTMLElement)) {
            return true;
        }
        const tag = target.tagName.toLowerCase();
        if (['input', 'select', 'textarea', 'button', 'summary'].includes(tag)) {
            return true;
        }
        if (tag === 'a' && target.hasAttribute('href')) {
            return true;
        }
        if ((tag === 'video' || tag === 'audio') && target.hasAttribute('controls')) {
            return true;
        }
        const tab = target.getAttribute('tabindex');
        if (tab !== null) {
            const n = parseInt(tab, 10);
            if (!Number.isNaN(n) && n >= 0) {
                return true;
            }
        }
        return false;
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.KeyboardController = KeyboardController;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/touch_controller.js ---------------
'use strict';
class TouchController {
    constructor(options = {}) {
        const target = options.target;
        this._target = target instanceof HTMLElement ? target : document.body;
        const threshold = options.threshold;
        this._threshold = typeof threshold === 'number' && threshold > 0 ? threshold : 100;
        this._tracking = false;
        this._originX  = 0;
        this._onStart = this._touchStart.bind(this);
        this._onMove  = this._touchMove.bind(this);
    }
    init() {
        this._target.addEventListener('touchstart', this._onStart, { passive: false });
        this._target.addEventListener('touchmove',  this._onMove,  { passive: false });
    }
    destroy() {
        this._target.removeEventListener('touchstart', this._onStart, false);
        this._target.removeEventListener('touchmove',  this._onMove,  false);
    }
    // -----------------------------------------------------------------------
    // Private
    // -----------------------------------------------------------------------
    _touchStart(event) {
        if (event.changedTouches.length === 0) {
            return;
        }
        event.preventDefault();
        this._tracking = true;
        this._originX  = event.changedTouches[0].pageX;
    }
    _touchMove(event) {
        if (!this._tracking || event.changedTouches.length === 0) {
            return;
        }
        const delta = this._originX - event.changedTouches[0].pageX;
        if (delta > this._threshold) {
            this._tracking = false;
            document.dispatchEvent(new CustomEvent('slides:navigate', {
                detail: { action: 'next' }
            }));
        } else if (delta < -this._threshold) {
            this._tracking = false;
            document.dispatchEvent(new CustomEvent('slides:navigate', {
                detail: { action: 'prev' }
            }));
        }
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.TouchController = TouchController;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/buttons_controller.js ---------------
'use strict';
class ButtonsController {
    constructor({
        prevButton         = null,
        nextButton         = null,
        backButton         = null,
        lastButton         = null,
        overviewButton     = null,
        presentationButton = null,
        fullscreenButton   = null,
        goToButton         = null,
    } = {}) {
        this._b = {
            prev:         this._el(prevButton),
            next:         this._el(nextButton),
            back:         this._el(backButton),
            last:         this._el(lastButton),
            overview:     this._el(overviewButton),
            presentation: this._el(presentationButton),
            fullscreen:   this._el(fullscreenButton),
            goto:         this._el(goToButton),
        };
        this._bindEvents();
    }
    // -----------------------------------------------------------------------
    // Called by SlidesAssembler via modeLogic.onModeChange
    // -----------------------------------------------------------------------
    onModeChange(data) {
        if (this._b.overview instanceof HTMLElement) {
            this._b.overview.toggleAttribute('disabled', data.mode === 'overview');
        }
        if (this._b.presentation instanceof HTMLElement) {
            this._b.presentation.toggleAttribute('disabled', data.mode === 'presentation');
        }
    }
    // -----------------------------------------------------------------------
    // Private
    // -----------------------------------------------------------------------
    _bindEvents() {
        const b = this._b;
        const nav  = (action, index, step) =>
            document.dispatchEvent(new CustomEvent('slides:navigate', {
                detail: { action, index, step }
            }));
        const mode = (m) =>
            document.dispatchEvent(new CustomEvent('slides:viewmode', {
                detail: { mode: m }
            }));
        b.prev?.addEventListener('click',     () => nav('prev'));
        b.next?.addEventListener('click',     () => nav('next'));
        b.back?.addEventListener('click',     () => nav('goStart'));
        b.last?.addEventListener('click',     () => nav('goEnd'));
        b.overview?.addEventListener('click', () => mode('overview'));
        b.presentation?.addEventListener('click', () => mode('presentation'));
        b.fullscreen?.addEventListener('click', () =>
            document.dispatchEvent(new CustomEvent('slides:fullscreen', { detail: {} }))
        );
        b.goto?.addEventListener('click', () => {
            const input = window.prompt('Go to slide number:');
            if (input !== null) {
                nav('goTo', Number(input), 0);
                mode('presentation');
            }
        });
    }
    _el(e) {
        return e instanceof HTMLElement ? e : null;
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.ButtonsController = ButtonsController;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/slides_assembler.js ---------------
'use strict';
class SlidesAssembler {
    constructor(config) {
        // ── 1. DATA ──────────────────────────────────────────────────────────
        this._data = new SlidesData(config.slides);
        this._data.autoPlay = Boolean(config.autoPlayEnabled);
        // ── 2. LOGIC ─────────────────────────────────────────────────────────
        this._navLogic  = new NavigationLogic(this._data);
        this._modeLogic = new ViewModeLogic(this._data);
        // ── 3. VIEWS ─────────────────────────────────────────────────────────
        this._presentationView = new PresentationView(
            config.slides,
            config.progressBar   instanceof HTMLElement ? config.progressBar   : null,
            config.controls      instanceof HTMLElement ? config.controls      : null,
            config.controlsView  instanceof HTMLElement ? config.controlsView  : null
        );
        this._overviewView = config.overviewContainer instanceof HTMLElement
            ? new OverviewView(config.slides, config.overviewContainer)
            : null;
        // ── 4. UTILITIES ─────────────────────────────────────────────────────
        this._focus      = new SlidesFocusController();
        this._fullscreen = new SlidesFullscreenController();
        this._visibilityManager = new SlidesVisibilityManager({
            accessibility: config.accessibility       instanceof HTMLElement ? config.accessibility       : null,
            controls:      config.controls            instanceof HTMLElement ? config.controls            : null,
            progress:      config.progressBarContainer instanceof HTMLElement ? config.progressBarContainer : null,
            logo:          config.logo                instanceof HTMLElement ? config.logo                : null,
        });
        // ── 5. CONTROLLERS ───────────────────────────────────────────────────
        this._helpDialog = new HelpDialog();
        this._keyboard = new KeyboardController();
        this._touch    = new TouchController();
        const c = config.controls;
        const v = config.controlsView;
        this._buttons = new ButtonsController({
            prevButton:         c?.querySelector('#btn-prev')         || null,
            nextButton:         c?.querySelector('#btn-next')         || null,
            backButton:         c?.querySelector('#btn-back')         || null,
            lastButton:         c?.querySelector('#btn-last')         || null,
            goToButton:         c?.querySelector('#btn-goto')         || null,
            overviewButton:     v?.querySelector('#btn-overview')     || null,
            presentationButton: v?.querySelector('#btn-presentation') || null,
            fullscreenButton:   c?.querySelector('#btn-fullscreen')   || null,
        });
        // ── 6. WIRE LOGIC → VIEWS (callbacks) ────────────────────────────────
        this._navLogic.onNavigate = (data) => {
            this._presentationView.render(data);
            this._focus.updateFocus(data.slides, data.currentIndex);
        };
        this._modeLogic.onModeChange = (data) => {
            this._presentationView.onModeChange(data);
            if (this._overviewView !== null) {
                this._overviewView.onModeChange(data);
            }
            this._buttons.onModeChange(data);
        };
        // ── 7. WIRE CUSTOM EVENTS → LOGIC ────────────────────────────────────
        document.addEventListener('slides:navigate', (e) => {
            this._dispatch(e.detail);
        });
        document.addEventListener('slides:viewmode', (e) => {
            const { mode, action } = e.detail;
            if (action === 'toggle') { this._modeLogic.toggle(); }
            else { this._modeLogic.set(mode); }
        });
        document.addEventListener('slides:visibility', (e) => {
            const { name, action } = e.detail;
            if (action === 'toggle') { this._visibilityManager.toggle(name); }
            else if (action === 'show')   { this._visibilityManager.show(name);   }
            else if (action === 'hide')   { this._visibilityManager.hide(name);   }
        });
        document.addEventListener('slides:fullscreen', () => {
            this._fullscreen.toggle();
        });
        document.addEventListener('slides:help', () => {
            this._helpDialog.toggle();
        });
        // ── 8. HASH CHANGE ───────────────────────────────────────────────────
        window.addEventListener('hashchange', () => {
            this._navLogic.updateFromHash(window.location.hash);
        });
        // ── 9. INITIAL MODE ──────────────────────────────────────────────────
        this._initialMode = ViewModeLogic.DEFAULT;
        if (typeof config.mode === 'string') {
            const modes = Object.values(ViewModeLogic.MODES);
            if (modes.includes(config.mode)) {
                this._initialMode = config.mode;
            }
        }
    }
    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    init() {
        // Build overview panel (before any mode is applied)
        if (this._overviewView !== null) {
            this._overviewView.build();
        }
        // Apply initial mode (fires onModeChange → updates views + buttons)
        this._modeLogic.set(this._initialMode);
        // Navigate to position from URL hash (fires onNavigate → renders)
        this._navLogic.updateFromHash(window.location.hash);
        // Start input controllers
        this._keyboard.init();
        this._touch.init();
    }
    get fullscreen() {
        return this._fullscreen;
    }
    // -----------------------------------------------------------------------
    // Private
    // -----------------------------------------------------------------------
    _dispatch(detail) {
        const { action, index, step } = detail;
        switch (action) {
            case 'next':          this._navLogic.next();                           break;
            case 'prev':          this._navLogic.prev();                           break;
            case 'goStart':       this._navLogic.goStart();                        break;
            case 'goEnd':         this._navLogic.goEnd();                          break;
            case 'goTo':          this._navLogic.goTo(Number(index) || 1, Number(step) || 0); break;
            case 'toggleContent': this._navLogic.toggleContent();                  break;
        }
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SlidesAssembler = SlidesAssembler;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- extras/slides/slides.js ---------------
'use strict';
class Slides {
    constructor(config = {}) {
        // --- Normalize configuration -----------------------------------------
        // We guarantee that "slides" is ALWAYS a true Array.
        // If user gives a NodeList, we convert it.
        // If user gives null/undefined, we use an empty Array.
        // Internal classes never need to question it.
        // ---------------------------------------------------------------------
        let slidesArray = [];
        if (Array.isArray(config.slides)) {
            slidesArray = config.slides;
        } else if (config.slides && typeof config.slides.length === 'number') {
            // NodeList or HTMLCollection
            slidesArray = Array.from(config.slides);
        } else {
            console.error('Slides: "slides" was not a valid list. Using [].');
            slidesArray = [];
        }
        const cleanedConfig = {
            ...config,
            slides: slidesArray
        };
        // --- Instantiate the internal application -----------------------------
        this._app = new SlidesAssembler(cleanedConfig);
    }
    init() {
        this._app.init();
    }
    get fullscreen() {
        return this._app.fullscreen;
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.Slides = Slides;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- dom-loader.js ---------------
class OnLoadManager {
    // FIELDS
    static #functions = [];
    // PUBLIC STATIC METHODS
    static addLoadFunction(func) {
        OnLoadManager.#functions.push(func);
    }
    static runLoadFunctions() {
        OnLoadManager.#functions.forEach(func => func());
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.OnLoadManager = OnLoadManager;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- accessibility.js ---------------
class AccessibilityManager extends BaseManager {
    // -----------------------------------------------------------------------
    // FIELDS
    // -----------------------------------------------------------------------
    #activatedColor;
    #activatedContrast;
    // -----------------------------------------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------------------------------------
    constructor() {
        super();
        this.#activatedColor = "";
        this.#activatedContrast = "";
        OnLoadManager.addLoadFunction(this.#loadBodyClasses.bind(this));
        OnLoadManager.addLoadFunction(this.#setAllLinksCustom.bind(this));
        OnLoadManager.addLoadFunction(this.#setSubmitCustom.bind(this));
    }
    // -----------------------------------------------------------------------
    // STATIC CONSTANTS
    // -----------------------------------------------------------------------
    static get COLOR_MODE()              { return "dark"; }
    static get CONTRAST_MODE()           { return "contrast"; }
    static get COLOR_PARAMETER_NAME()    { return "wexa_color"; }
    static get CONTRAST_PARAMETER_NAME() { return "wexa_contrast"; }
    // -----------------------------------------------------------------------
    // GETTERS
    // -----------------------------------------------------------------------
    get activatedColorMode() {
        return this.#activatedColor;
    }
    // -----------------------------------------------------------------------
    get activatedContrastMode() {
        return this.#activatedContrast;
    }
    // -----------------------------------------------------------------------
    // PUBLIC METHODS
    // -----------------------------------------------------------------------
    async switchColorScheme() {
        if (this.#activatedColor === "") {
            this.#activatedColor = AccessibilityManager.COLOR_MODE;
            document.body.classList.add(AccessibilityManager.COLOR_MODE);
        } else {
            this.#activatedColor = "";
            document.body.classList.remove(AccessibilityManager.COLOR_MODE);
        }
        this.#updateButtonState('btn-theme');
        await this.postEvents({"accessibility_color": this.#activatedColor});
    }
    // -----------------------------------------------------------------------
    async switchContrastScheme() {
        if (this.#activatedContrast === "") {
            this.#activatedContrast = AccessibilityManager.CONTRAST_MODE;
            document.body.classList.add(AccessibilityManager.CONTRAST_MODE);
        } else {
            this.#activatedContrast = "";
            document.body.classList.remove(AccessibilityManager.CONTRAST_MODE);
        }
        this.#updateButtonState('btn-contrast');
        await this.postEvents({"accessibility_contrast": this.#activatedContrast});
    }
    // -----------------------------------------------------------------------
    goToLink(element, openInNewTab = false) {
        const rawHref = element.getAttribute('href');
        if (rawHref === null || rawHref === '') {
            return;
        }
        const url = new URL(element.href, window.location.href);
        let targetUrl;
        if (window.location.protocol !== 'file:' && (window.location.hostname === 'localhost' || url.host === window.location.host)) {
            targetUrl = this.setUrlWithParameters(url.href);
        } else {
            targetUrl = url.href;
        }
        if (openInNewTab === true) {
            window.open(targetUrl, '_blank', 'noopener');
            return;
        }
        document.location.href = targetUrl;
    }
    // -----------------------------------------------------------------------
    setUrlWithParameters(url) {
        if (url === null || url === '') {
            return '';
        }
        const customUrl = new URL(url, window.location.href);
        if (this.#activatedColor !== '') {
            customUrl.searchParams.set(AccessibilityManager.COLOR_PARAMETER_NAME, this.#activatedColor);
        } else {
            customUrl.searchParams.delete(AccessibilityManager.COLOR_PARAMETER_NAME);
        }
        if (this.#activatedContrast !== '') {
            customUrl.searchParams.set(AccessibilityManager.CONTRAST_PARAMETER_NAME, this.#activatedContrast);
        } else {
            customUrl.searchParams.delete(AccessibilityManager.CONTRAST_PARAMETER_NAME);
        }
        return customUrl.href;
    }
    // -----------------------------------------------------------------------
    // PRIVATE METHODS
    // -----------------------------------------------------------------------
    async #loadBodyClasses() {
        const params = new URLSearchParams(window.location.search);
        const events = {};
        if (params.has(AccessibilityManager.COLOR_PARAMETER_NAME)) {
            const colorParam = params.get(AccessibilityManager.COLOR_PARAMETER_NAME).toLowerCase();
            if (colorParam === AccessibilityManager.COLOR_MODE) {
                this.#activatedColor = colorParam;
                document.body.classList.add(colorParam);
                events.accessibility_color = this.#activatedColor;
            } else {
                console.log(AccessibilityManager.COLOR_PARAMETER_NAME + " unknown value: " + colorParam);
            }
        }
        if (params.has(AccessibilityManager.CONTRAST_PARAMETER_NAME)) {
            const contrastParam = params.get(AccessibilityManager.CONTRAST_PARAMETER_NAME).toLowerCase();
            if (contrastParam === AccessibilityManager.CONTRAST_MODE) {
                this.#activatedContrast = contrastParam;
                document.body.classList.add(contrastParam);
                events.accessibility_contrast = this.#activatedContrast;
            } else {
                console.log(AccessibilityManager.CONTRAST_PARAMETER_NAME + " unknown value: " + contrastParam);
            }
        }
        if (Object.keys(events).length > 0) {
            await this.postEvents(events);
        }
    }
    // -----------------------------------------------------------------------
    #setAllLinksCustom() {
        let linkElements = Array.from(document.querySelectorAll("a"));
        linkElements = linkElements.filter(el => el.href !== null && el.href !== '');
        linkElements.forEach(element => {
            element.addEventListener("click", event => {
                event.preventDefault();
                this.goToLink(element, element.target === '_blank');
            });
        });
    }
    // -----------------------------------------------------------------------
    #setSubmitCustom() {
        const submitButton = document.querySelector('button[type="submit"]');
        if (!submitButton) return;
        submitButton.addEventListener('click', () => {
            const form = document.querySelector('form');
            if (form) {
                form.action = this.setUrlWithParameters(form.action);
            }
        });
    }
    // -----------------------------------------------------------------------
    #updateButtonState(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn === null) { console.error(`Button not found: ${buttonId}.`); return; }
        let pressed = false;
        if (buttonId === 'btn-contrast') { pressed = this.#activatedContrast !== ''; }
        else if (buttonId === 'btn-theme') { pressed = this.#activatedColor !== ''; }
        else { console.error(`Unknown button id: ${buttonId}.`); return; }
        btn.setAttribute('aria-pressed', String(pressed));
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.AccessibilityManager = AccessibilityManager;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- menu.js ---------------
'use strict';
// --------------------------------------------------------------------------
// Class: SubMenuManager
// --------------------------------------------------------------------------
class SubMenuManager {
    // --------------------------------------------------------------------
    // Protected members
    // --------------------------------------------------------------------
    #asideElement;
    #menuLinks;
    _focusTrapHandler;
    // --------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------
    constructor(asideId = 'appmenu') {
        this.#asideElement = document.getElementById(asideId);
        // Include both <a> and <button> elements as focusable links.
        this.#menuLinks = this.#asideElement
            ? this.#asideElement.querySelectorAll('a, button')
            : [];
        // Bind the focus trap handler to preserve context when used as an event listener.
        this._focusTrapHandler = this.#trapFocus.bind(this);
    }
    // --------------------------------------------------------------------
    // Public methods
    // --------------------------------------------------------------------
    openSubmenu() {
        this.#setOpenState(true);
    }
    // --------------------------------------------------------------------
    closeSubmenu() {
        this.#setOpenState(false);
    }
    // --------------------------------------------------------------------
    // Private methods
    // --------------------------------------------------------------------
    #setOpenState(open) {
        if (this.#asideElement === null) return;
        const opened = open === true;
        // Toggle CSS class to open or close the submenu.
        this.#asideElement.classList.toggle('open', opened);
        // Update tab index of contained links.
        this.#setLinksTabIndex(opened ? 0 : -1);
        // Manage focus trapping when opened.
        if (opened === true) {
            document.addEventListener('keydown', this._focusTrapHandler, true);
            const onTransitionEnd = (ev) => {
                if (['left', 'right', 'top', 'bottom'].includes(ev.propertyName)) {
                    this.#menuLinks[0]?.focus();
                    this.#asideElement.removeEventListener('transitionend', onTransitionEnd);
                }
            };
            this.#asideElement.addEventListener('transitionend', onTransitionEnd);
        } else {
            document.removeEventListener('keydown', this._focusTrapHandler, true);
        }
        // Apply CSS-based positioning and alignment.
        this.#adjustSubmenuPosition();
        this.#adjustSubmenuAlignment();
    }
    // --------------------------------------------------------------------
    #adjustSubmenuPosition() {
        const position = getComputedStyle(this.#asideElement)
            .getPropertyValue('--appmenu-position')
            .trim();
        // Default to 'left' if no value found.
        this.#asideElement.setAttribute('data-submenu-position', position || 'left');
        // Force a reflow to ensure visual update.
        this.#asideElement.offsetHeight;
    }
    // --------------------------------------------------------------------
    #adjustSubmenuAlignment() {
        const align = getComputedStyle(this.#asideElement)
            .getPropertyValue('--appmenu-align')
            .trim();
        const [horizontal = 'center', vertical = 'center'] = align.split(' ');
        this.#asideElement.setAttribute('data-submenu-align-horizontal', horizontal);
        this.#asideElement.setAttribute('data-submenu-align-vertical', vertical);
        // Force reflow to apply updated alignment.
        this.#asideElement.offsetHeight;
    }
    // --------------------------------------------------------------------
    #trapFocus(e) {
        if (e.key !== 'Tab') return;
        const focusable = Array.from(this.#menuLinks);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            // Shift + Tab: move from first to last
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            // Tab: move from last to first
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
    // --------------------------------------------------------------------
    #setLinksTabIndex(value) {
        for (const link of this.#menuLinks) {
            link.tabIndex = value;
        }
    }
}
// --------------------------------------------------------------------------
// Manager for an accessible menu
// --------------------------------------------------------------------------
class MenuManager {
    // --------------------------------------------------------------------
    // Protected members
    // --------------------------------------------------------------------
    // The '<nav>' element this class is managing
    #navElement;
    // A dictionary of registered submenus: each key is the submenu
    // identifier, and the value is its associated toggle button element.
    #submenus = new Map();
    // --------------------------------------------------------------------
    // Public members
    // --------------------------------------------------------------------
    static DEFAULT_NAV_ID = 'nav-content';
    // ----------------------------------------------------------------------
    constructor(navId = MenuManager.DEFAULT_NAV_ID) {
        this.#navElement = document.getElementById(navId);
        if (!this.#navElement) {
            throw new Error(`MenuManager: nav with id '${navId}' not found.`);
        }
        // Dictionary of registered submenus.
        this.#submenus = new Map();
        document.addEventListener('click', (e) => this.#handleBodyClick(e), true);
    }
    // ----------------------------------------------------------------------
    registerSubmenu(asideId, toggleButtonId) {
        const aside = document.getElementById(asideId);
        const toggle = document.getElementById(toggleButtonId);
        // Validate required elements.
        if (aside === null || toggle === null) {
            WexaLogger.warn(`MenuManager: Invalid submenu registration: '${asideId}'.`);
            return;
        }
        // Create submenu instance and store association.
        const submenu = new SubMenuManager(asideId);
        this.#submenus.set(submenu, toggle);
        this.#initToggleAttributes(toggle, asideId);
        this.#bindToggleEvents(submenu, toggle);
    }
    // ----------------------------------------------------------------------
    initSideMenu(navSelector = 'nav#nav-content.side.collapsible', pinButtonId = 'pin-menu') {
        const nav = document.querySelector(navSelector);
        const pinBtn = document.getElementById(pinButtonId);
        if (!nav) {
            WexaLogger.warn(`MenuManager: Side menu not found with selector '${navSelector}'.`);
            return;
        }
        if (!pinBtn) {
            WexaLogger.warn(`MenuManager: Pin button not found with id '${pinButtonId}'.`);
            return;
        }
        pinBtn.addEventListener('click', () => {
            const isPinned = nav.classList.toggle('expanded');
            nav.setAttribute('aria-pinned', isPinned ? 'true' : 'false');
            pinBtn.setAttribute('aria-pressed', String(isPinned));
            pinBtn.setAttribute('aria-label', isPinned ? 'Unpin menu' : 'Pin menu');
        });
    }
    // ----------------------------------------------------------------------
    initMobileToggle(checkboxId = 'mobile', buttonId = 'menu-button') {
        const checkbox = document.getElementById(checkboxId);
        const button = document.getElementById(buttonId);
        // Validate required elements.
        if (checkbox === null || button === null) {
            WexaLogger.warn('MenuManager: Missing elements for mobile toggle.');
            return;
        }
        // Bind state synchronization.
        checkbox.addEventListener('change', () => {
            this.#updateMobileState(checkbox, button);
        });
        // Bind button activation.
        button.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            this.#updateMobileState(checkbox, button);
        });
        // Initialize current state.
        this.#updateMobileState(checkbox, button);
    }
    // ----------------------------------------------------------------------
    // Private
    // ----------------------------------------------------------------------
    #initToggleAttributes(toggle, asideId) {
        toggle.setAttribute('aria-controls', asideId);
        toggle.setAttribute('aria-haspopup', 'menu');
        toggle.setAttribute('aria-expanded', 'false');
    }
    // ----------------------------------------------------------------------
    #bindToggleEvents(submenu, toggle) {
        const activate = (event) => {
            event.preventDefault();
            event.stopPropagation();
            // Collapse main menu if not pinned.
            const pin = document.getElementById('pin-menu');
            const isPinned = pin !== null && pin.getAttribute('aria-pressed') === 'true';
            if (isPinned === false) {
                this.#navElement.classList.remove('expanded');
                this.#navElement.setAttribute('aria-expanded', 'false');
            }
            this.#closeOtherSubmenus(submenu);
            submenu.openSubmenu();
            toggle.setAttribute('aria-expanded', 'true');
        };
        toggle.addEventListener('click', activate);
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') activate(e);
        });
    }
    // ----------------------------------------------------------------------
    #closeOtherSubmenus(current) {
        for (const [submenu, toggle] of this.#submenus) {
            if (submenu !== current) {
                submenu.closeSubmenu();
                toggle.setAttribute('aria-expanded', 'false');
            }
        }
    }
    // ----------------------------------------------------------------------
    #handleBodyClick(event) {
        const target = event.target;
        // Ignore clicks inside the main nav or any open aside
        const insideNav   = this.#navElement.contains(target);
        const insideAside = target.closest('aside.appmenu.open') !== null;
        if (insideNav || insideAside) return;
        // Otherwise close all submenus
        for (const [submenu, toggle] of this.#submenus) {
            submenu.closeSubmenu();
            toggle.setAttribute('aria-expanded', 'false');
        }
        // Remove transient state flags
        this.#navElement.classList.remove('submenu-active');
    }
    // ----------------------------------------------------------------------
    #updateMobileState(checkbox, button) {
        const expanded = checkbox.checked === true;
        this.#navElement.classList.toggle('expanded', expanded);
        this.#navElement.setAttribute('aria-expanded', String(expanded));
        button.setAttribute('aria-expanded', String(expanded));
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SubMenuManager = SubMenuManager;
window.Wexa.MenuManager = MenuManager;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- dialog.js ---------------
'use strict';
class DialogManager {
    // --------------------------------------------------------------------
    // Members
    // --------------------------------------------------------------------
    #dialogs;
    #closeButtonName;
    #videoPrefix;
    #dialogPrefix;
    // --------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------
    constructor() {
        this.#dialogs = new Map();
        this.#closeButtonName = 'popup-close-btn';
        this.#videoPrefix = 'popup-video-';
        this.#dialogPrefix = 'popup-';
    }
    // --------------------------------------------------------------------
    // Public methods
    // --------------------------------------------------------------------
    open(id, isModal = false) {
        const dialog = this.#getDialog(id);
        if (dialog === null) return;
        // Replace hidden class to make the dialog visible.
        dialog.classList.replace('hidden-alert', 'hidden-alert-open');
        // Ensure a single close button is available.
        this.#createCloseButton(dialog);
        // Open the dialog, preferring modal mode if requested and supported.
        if (isModal === true && typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else if (typeof dialog.show === 'function') {
            dialog.show();
        } else {
            dialog.setAttribute('open', '');
        }
    }
    // --------------------------------------------------------------------
    close(id) {
        const dialog = this.#getDialog(id);
        if (dialog === null) return;
        // Restore the hidden class to hide the dialog.
        dialog.classList.replace('hidden-alert-open', 'hidden-alert');
        // Remove the close button if present.
        Array.from(dialog.children).forEach(child => {
            if (child.name === this.#closeButtonName) {
                child.remove();
            }
        });
        // Close the dialog (prefer the native method if supported).
        if (typeof dialog.close === 'function') {
            dialog.close();
        } else {
            dialog.removeAttribute('open');
        }
    }
    // --------------------------------------------------------------------
    async playVideo(id) {
        const popupId = this.#dialogPrefix + id;
        this.open(popupId, true);
        const video = document.getElementById(this.#videoPrefix + id);
        if (video === null) {
            WexaLogger.error(`DialogManager: video not found for '${id}'.`);
            return;
        }
        // Trigger quick playback to preload video data.
        await video.play();
        video.pause();
    }
    // --------------------------------------------------------------------
    closeVideo(id) {
        const popupId = this.#dialogPrefix + id;
        this.close(popupId);
        const video = document.getElementById(this.#videoPrefix + id);
        if (video !== null) {
            // Pause playback to release resources.
            video.pause();
        } else {
            WexaLogger.warn(`DialogManager: video not found for '${id}'.`);
        }
    }
    // --------------------------------------------------------------------
    // Private methods
    // --------------------------------------------------------------------
    #getDialog(id) {
        if (this.#dialogs.has(id)) {
            return this.#dialogs.get(id);
        }
        const dialog = document.getElementById(id);
        if (dialog === null) {
            WexaLogger.error(`DialogManager: dialog not found: '${id}'.`);
            return null;
        }
        this.#dialogs.set(id, dialog);
        return dialog;
    }
    #createCloseButton(dialog) {
        if (dialog.querySelector(`button[name="${this.#closeButtonName}"]`) !== null) {
            return;
        }
        const btn = document.createElement('button');
        btn.name = this.#closeButtonName;
        btn.type = 'button';
        btn.innerHTML = '&#10060;';
        btn.addEventListener('click', () => this.close(dialog.id));
        dialog.appendChild(btn);
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.DialogManager = DialogManager;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- progressbar.js ---------------
class ProgressBar extends BaseManager {
    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    constructor(options = {}) {
        super();
        this._updateCallback = options.updateCallback || null;
        this._completeCallback = options.completeCallback || null;
        this._requestManager = options.requestManager || null;
        this._targetUrl = options.targetUrl || '';
        this._intervalMs = options.intervalMs || 1500;
        this._domIds = options.domIds || {
            percent: 'percent_progress',
            text: 'progress_text',
            header: 'progress_header'
        };
        this._intervalId = null;
        this._percent = 0;
        this._text = '';
        this._header = '';
    }
    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    start() {
        this.stop();
        WexaLogger.debug("Progress start:")
        this._intervalId = setInterval(async () => {
            const response = await this._fetchProgressData();
            if (response === null) {
                WexaLogger.warn(" == Empty response == ")
                await this._fetchComplete();
                return;
            }
            // Stop updates when installation is completed.
            if ((this._requestManager && this._requestManager.status === 200) || response.status === 200) {
                WexaLogger.debug(" == STATUS 200 RECEIVED ==")
                await this._fetchComplete();
                return
            }
            // The progress is updated
            this._updateDisplay(response.percent, response.text, response.header);
            if (this._percent >= 100) {
                WexaLogger.debug(" == PERCENT COMPLETED ==")
                await this._fetchComplete();
            }
        }, this._intervalMs);
    }
    // -----------------------------------------------------------------------
    stop() {
        WexaLogger.debug("Progress stop:")
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }
    // -----------------------------------------------------------------------
    update(percent, text, header) {
        WexaLogger.debug("Progress update:")
        this._updateDisplay(percent, text, header);
    }
    // -----------------------------------------------------------------------
    setRequestManager(requestManager, targetUrl) {
        this._requestManager = requestManager;
        this._targetUrl = targetUrl;
    }
    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------
    async _fetchComplete() {
        this.stop();
        if (this._completeCallback !== null) {
            this._completeCallback();
        } else {
            this.submitForm('event_bake', 'complete');
        }
    }
    // -----------------------------------------------------------------------
    async _fetchProgressData() {
        if (this._updateCallback !== null) {
            return await this._updateCallback();
        }
        if (this._requestManager === null || this._targetUrl === '') {
            WexaLogger.error('ProgressBar: No update callback or RequestManager available.');
            return null;
        }
        const response = await this.postEvents({event_name: 'update'});
        return response
    }
    // -----------------------------------------------------------------------
    _updateDisplay(percent, text, header) {
        if (typeof percent === 'number') {
            this._percent = percent;
        }
        if (typeof text === 'string') {
            this._text = text;
        }
        if (typeof header === 'string') {
            this._header = header;
        }
        this._render();
    }
    // -----------------------------------------------------------------------
    _render() {
        const percentEl = document.getElementById(this._domIds.percent);
        const textEl = document.getElementById(this._domIds.text);
        const headerEl = document.getElementById(this._domIds.header);
        if (percentEl !== null) {
            percentEl.value = this._percent;
        }
        if (textEl !== null) {
            textEl.textContent = this._text;
        }
        if (headerEl !== null) {
            headerEl.textContent = this._header;
        }
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.ProgressBar = ProgressBar;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- book.js ---------------
'use strict';
class Book {
    // FIELDS
    #toc_element;
    #headings_container;
    #html_tags;
    // CONSTRUCTOR
    constructor(id_headings, id_toc = "toc") {
        this.#toc_element = document.getElementById(id_toc);
        this.#headings_container = document.getElementById(id_headings);
        this.#html_tags = "h1, h2, h3, h4";
    }
    // GETTERS
    get dom_toc() {
        return this.#toc_element;
    }
    get headings() {
        return this.#headings_container;
    }
    get html_tags() {
        return this.#html_tags;
    }
    // PUBLIC METHODS
    set_headings(id_headings) {
        this.#headings_container =  document.getElementById(id_headings);
    }
    add_html_tags(...tags) {
        tags.forEach(current => {
            this.#html_tags += ", " + current
        });
    }
    delete_html_tags(...tags) {
        tags.forEach(current => {
            this.#html_tags = this.#html_tags.replace(", " + current, "");
        });
    }
    fill_table(only_numerate_headings = true) {
        if (!(this.#toc_element instanceof HTMLElement)) return;
        const headings = this.#get_headings(only_numerate_headings);
        headings.forEach((heading, index) => {
            /* Add the anchor right before the heading */
            let anchor = document.createElement('a');
            anchor.setAttribute("id", 'toc' + index);
            anchor.setAttribute("name", 'toc' + index);
            /* Add an entry into the table of content */
            let link = document.createElement('a');
            link.setAttribute('href', '#toc' + index);
            link.textContent = heading.textContent;
            let item = document.createElement('li');
            item.setAttribute('class', heading.tagName.toLowerCase());
            item.appendChild(link);
            this.#toc_element.appendChild(item);
            heading.parentNode.insertBefore(anchor, heading);
        });
    }
    // PRIVATE METHODS
    #get_headings(only_numerate_headings) {
        if (!(this.#headings_container instanceof HTMLElement)) return [];
        const titles = Array.from(this.#headings_container.querySelectorAll(this.#html_tags));
        let headings = [];
        titles.forEach(current => {
            if (only_numerate_headings) {
                // check if the heading begin by a number
                const c = window.getComputedStyle(current, '::before')['content'];
                if (c && c !== 'none' && c !== '""' && c !== "''") {
                    headings.push(current);
                }
            } else {
                headings.push(current);
            }
        });
        return headings;
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.Book = Book;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- sortatable.js ---------------
class SortaTable {
    // FIELDS
    _tableElt
    _className
    // CONSTRUCTOR
    constructor(tableId) {
        // Name of the CSS class used by the button in the <th> element
        this._className = ".sortatable";
        console.debug("Sortatable is instantiated for table element: ", tableId);
        // The <table> element which is manipulated in this class
        this._tableElt = document.getElementById(tableId);
        if (!this._tableElt) {
            // Table element is not found, log a warning and prevent further execution
            console.warn(`No table element found with id: ${tableId}. SortaTable instantiation is skipped.`);
            return;
        }
        // Store original rows order
        const tbody = this._tableElt.querySelector('tbody');
        const rows = Array.from(tbody.getElementsByTagName('tr'));
        rows.forEach((row, index) => {
            row.setAttribute('data-original-index', index);
        });
    }
    // ----------------------------------------------------------------------
    // PUBLIC
    // ----------------------------------------------------------------------
    getTableId() {
        return this._tableElt.getAttribute("id");
    }
    // ----------------------------------------------------------------------
    attachSortListeners() {
        if (!this._tableElt) {
            return;
        }
        console.debug("Attach sort listeners for table " + this._tableElt);
        // Add event listeners to all headers with class 'sortatable'
        const sortButtons = this._tableElt.querySelectorAll(this._className);
        console.debug("Found " + sortButtons.length + " sort buttons in headers");
        sortButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                console.debug(" ... button: ", `[${button}]`);
                // Retrieve the data-sort attribute from the clicked header
                const sortAttribute = button.getAttribute('data-sort');
                const isAsc = button.classList.contains('sort-asc');
                const isDesc = button.classList.contains('sort-desc');
                // Remove sort classes from all headers to reset the state
                this._tableElt.querySelectorAll(this._className).forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                // Call the sortTable function to sort the table rows and update button
                // Toggle between 3 states: no sort -> ascending -> descending
                if (isAsc) {
                    button.classList.remove('sort-asc');
                    button.classList.add('sort-desc');
                    this.#sortTable(sortAttribute, false);
                } else if (isDesc) {
                    button.classList.remove('sort-desc');
                    // No sort applied, reset table
                    this.#noSortTable();
                } else {
                    button.classList.add('sort-asc');
                    this.#sortTable(sortAttribute, true);
                }
                event.stopPropagation();
            });
        });
    }
    // ----------------------------------------------------------------------
    sort(column, isAsc = true) {
        // Sort the table based on the specified column
        this.#sortTable(column, isAsc);
        // Optionally, update the class on the header to reflect the current sort direction
        const headerButton = this._tableElt.querySelector(`button[data-sort="${column}"]`);
        if (headerButton) {
            this._tableElt.querySelectorAll(this._className).forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            headerButton.classList.add(isAsc ? 'sort-asc' : 'sort-desc');
        }
    }
    // ----------------------------------------------------------------------
    toggleColumnVisibility(checkBoxes) {
        // Iterate over each checkbox in checkBoxes
        checkBoxes.forEach(checkbox => {
            // Check if the checkbox has a data-toggle attribute
            const columnName = checkbox.getAttribute('data-toggle');
            if (!columnName) {
                console.warn("Checkbox does not have a data-toggle attribute. Skipping...");
                return; // Skip this checkbox if it doesn't have a data-toggle attribute
            }
            // Initialize column index
            let columnIndex = -1;
            // Iterate through the header cells to find the index
            const headerCells = this._tableElt.querySelectorAll('thead th');
            for (let index = 0; index < headerCells.length; index++) {
                const cell = headerCells[index];
                // Check if the cell has the data-sort attribute matching columnName
                if (cell.getAttribute('data-sort') === columnName) {
                    columnIndex = index; // Store the column index
                    break; // Exit the loop early since we've found the column
                }
                // Find the button with class "sortatable"
                const button = cell.querySelector(this._className);
                // Check if the button exists and matches the column name
                if (button && button.getAttribute('data-sort') === columnName) {
                    columnIndex = index; // Store the column index
                    break; // Exit the loop early since we've found the column
                }
            }
            // If columnIndex is found, toggle its visibility
            if (columnIndex !== -1) {
                // Get the checkbox state (checked or not)
                const checkboxState = checkbox.checked;
                // Use the columnVisibility method to update the visibility
                this.columnVisibility(columnIndex, checkboxState);
                // Optionally recalculate table width after updating visibility
                this._tableElt.style.width = '100%';
            } else {
                console.warn(`Column with name "${columnName}" not found.`);
            }
        });
    }
    // ----------------------------------------------------------------------
    columnVisibility(columnIndex, show) {
        // Get all table rows
        const rows = this._tableElt.rows;
        // Iterate over each row (including header)
        for (let i = 0; i < rows.length; i++) {
            const cell = rows[i].cells[columnIndex];
            if (cell) {
                // Toggle the 'hidden' class based on the show flag
                if (show) {
                    cell.classList.remove('hidden');
                } else {
                    cell.classList.add('hidden');
                }
            }
        }
    }
    // ----------------------------------------------------------------------
    // PRIVATE
    // ----------------------------------------------------------------------
    #noSortTable() {
        const tbody = this._tableElt.querySelector('tbody');
        const rows = Array.from(tbody.getElementsByTagName('tr'));
        // Re-organize lines by their original order
        rows.sort((a, b) => a.getAttribute('data-original-index') - b.getAttribute('data-original-index'));
        rows.forEach(row => tbody.appendChild(row));
    }
    // ----------------------------------------------------------------------
    #sortTable(sortAttribute, isAsc) {
        // Get the index of the column to sort by
        const columnIndex = this._tableElt.querySelector(`button[data-sort="${sortAttribute}"]`).closest('th').cellIndex;
        // Get the tbody element from the table
        const tableBody = this._tableElt.querySelector('tbody');
        // Convert the HTMLCollection of rows into an array for sorting
        const rows = Array.from(tableBody.getElementsByTagName('tr'));
        // Check if the attribute to sort by is 'date'
        const isDate = sortAttribute === 'date';
        // Sort the rows array using a custom comparator
        rows.sort((a, b) => {
            // Fetch the text content of the cells in the current column
            let aValue = a.cells[columnIndex].textContent.trim();
            let bValue = b.cells[columnIndex].textContent.trim();
            // If the attribute is 'date', convert string to Date object
            if (isDate) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            // Determine the sort order based on the cell values and isAsc flag
            if (aValue < bValue) return isAsc ? -1 : 1;
            if (aValue > bValue) return isAsc ? 1 : -1;
            return 0;
        });
        // Re-append sorted rows back to the table body
        rows.forEach(row => tableBody.appendChild(row));
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.SortaTable = SortaTable;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- toggleselect.js ---------------
// --------------------------------------------------------------------------
class ToggleSelector {
    // Define base path and icon names as member variables
    static ICON_PATH = "./whakerkit/icons";
    // Icon names for different states
    static ICONS = {
        CHECKED: "checked.png",
        UNCHECKED: "unchecked.png",
        HALF_CHECKED: "half-checked.png",
        HALF_UNCHECKED: "half-unchecked.png",
        HALF_CHECKED_DARK: "half-checked-dark.png",
        HALF_UNCHECKED_DARK: "half-unchecked-dark.png",
        CHECKED_DARK: "checked-dark.png",
        UNCHECKED_DARK: "unchecked-dark.png"
    };
    // Define CSS selectors for buttons and checkboxes
    static BUTTON_SELECTOR = 'button.accordion-action';
    static CHECKBOX_SELECTOR = 'input[type="checkbox"]';
    // Fields
    _iconPath;
    _detailsElt;
    // Constructor
    constructor(icon_path, detailsId) {
        if (icon_path) {
            this._iconPath = icon_path;
        } else {
            this._iconPath = ToggleSelector.ICON_PATH;
        }
        // The <details> element which is manipulated in this class
        this._detailsElt = document.getElementById(detailsId);
        if (!this._detailsElt) {
            throw new Error(`ToggleSelector instantiation failed: No details element found with id: ${detailsId}.`);
        }
        // Call handleInputsOnLoad() to initialize any inputs or settings
        this.handleInputsOnLoad();
    }
    // ----------------------------------------------------------------------
    getCheckboxes() {
        return this._detailsElt.querySelectorAll('input[type="checkbox"][data-toggle]');
    }
    // ----------------------------------------------------------------------
    handleInputsOnLoad() {
        // Setup listeners for checkboxes
        this.setupCheckboxListeners();
        // Update all toggle buttons to adjust colors with theme
        this.updateAllToggleButtons();
        // Attach event listener for click events on checkboxes
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.type === 'checkbox') {
                this.updateAllToggleButtons();
            }
        });
    }
    // ----------------------------------------------------------------------
    toggleSelection(event) {
        const checkboxes = this.getCheckboxes();
        const button = event.currentTarget;
        // Check if any of the checkboxes are already checked
        const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        // Toggle the checked state of all checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.checked = !anyChecked;
        });
        // Update the button image based on the new state
        this.updateToggleButton(button, !anyChecked);
    }
    // ----------------------------------------------------------------------
    updateToggleButton(button, anyChecked, oneChecked = false, check = false) {
        // Get the image inside the button
        const toggleImg = button.querySelector('img');
        // Detect if dark mode is active
        const isDarkMode = document.body.classList.contains('dark');
        let imgSrc = ""; // Variable to hold the image source path
        // Determine which image to display based on the checkbox states
        if (oneChecked && check) {
            imgSrc = isDarkMode ?
                `${this._iconPath}/${ToggleSelector.ICONS.HALF_CHECKED_DARK}` :
                `${this._iconPath}/${ToggleSelector.ICONS.HALF_CHECKED}`;
        } else if (oneChecked && !check) {
            imgSrc = isDarkMode ?
                `${this._iconPath}/${ToggleSelector.ICONS.HALF_UNCHECKED_DARK}` :
                `${this._iconPath}/${ToggleSelector.ICONS.HALF_UNCHECKED}`;
        } else {
            imgSrc = anyChecked
                ? (isDarkMode ?
                    `${this._iconPath}/${ToggleSelector.ICONS.CHECKED_DARK}` :
                    `${this._iconPath}/${ToggleSelector.ICONS.CHECKED}`)
                : (isDarkMode ?
                    `${this._iconPath}/${ToggleSelector.ICONS.UNCHECKED_DARK}` :
                    `${this._iconPath}/${ToggleSelector.ICONS.UNCHECKED}`);
        }
        // Update the image source
        if (toggleImg) {
            toggleImg.src = imgSrc;
        } else {
            console.error(`Image not found in button: ${button.id}`);
        }
    }
    // ----------------------------------------------------------------------
    setupCheckboxListeners() {
        const checkboxes = this.getCheckboxes();
        const button = this._detailsElt.querySelector('button.accordion-action[data-toggle]');
        // Add a 'change' event listener to each checkbox
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // At least one is checked
                const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
                // All are checked
                const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
                // Log the state for debugging purposes
                console.log(`Checkbox ${checkbox.id} changed. Any checked: ${anyChecked}, All checked: ${allChecked}`);
                // Update button based on the state
                this.updateButtonState(button, anyChecked, allChecked);
            });
        });
    }
    // ----------------------------------------------------------------------
    updateButtonState(button, anyChecked, allChecked) {
        if (allChecked) {
            this.updateToggleButton(button, anyChecked);
        } else if (anyChecked) {
            this.updateToggleButton(button, anyChecked, true, true);
        } else {
            this.updateToggleButton(button, anyChecked, false, false);
        }
    }
    // ----------------------------------------------------------------------
    updateAllToggleButtons() {
        const buttons = this._detailsElt.querySelectorAll(ToggleSelector.BUTTON_SELECTOR);
        buttons.forEach(button => {
            const checkboxes = button.closest('details').querySelectorAll(ToggleSelector.CHECKBOX_SELECTOR);
            const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            // Update button based on the state of checkboxes
            this.updateButtonState(button, anyChecked, allChecked);
        });
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.ToggleSelector = ToggleSelector;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- links.js ---------------
'use strict';
class LinkController {
    constructor() {
        // Nothing to initialize; listeners are attached explicitly via handleLinks().
    }
    // ----------------------------------------------------------------------
    handleLinks(selectors) {
        this._bindLinks(selectors, false);
    }
    handleLinksWithParameters(selectors) {
        this._bindLinks(selectors, true);
    }
    // ----------------------------------------------------------------------
    // Private
    // ----------------------------------------------------------------------
    _bindLinks(selectors, withParameters) {
        if (!Array.isArray(selectors)) {
            console.error('LinkController: Expected a list of element ids.');
            return;
        }
        for (const id of selectors) {
            const element = document.getElementById(id);
            if (element === null) {
                console.warn(`LinkController: No element found with id "${id}".`);
                continue;
            }
            // Avoid multiple bindings on the same element
            if (element.dataset.linkBound) continue;
            element.dataset.linkBound = '1';
            element.addEventListener('click', (event) => this._handleActivation(event, element, withParameters));
            element.addEventListener('keydown', (event) => this._handleActivation(event, element, withParameters));
        }
    }
    // ----------------------------------------------------------------------
    _handleActivation(event, element, withParameters) {
        const isClick = (event.type === 'click');
        const isEnter = (event.type === 'keydown' && event.key === 'Enter');
        if (isClick === false && isEnter === false) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const url = element.getAttribute('href') || element.dataset.href;
        if (!url) {
            console.warn(`LinkController: No URL defined for element id="${element.id}".`);
            return;
        }
        const target = element.dataset.target || '_blank';
        this._openUrl(url, target, withParameters);
    }
    // ----------------------------------------------------------------------
    _openUrl(url, target, withParameters) {
        let finalUrl = url;
        if (withParameters === true) {
            const absoluteUrl = new URL(url, window.location.href).href;
            finalUrl = window.Wexa.accessibility.setUrlWithParameters(absoluteUrl);
        }
        if (target === '_blank' || target === '_self') {
            window.open(finalUrl, target, 'noopener');
            return;
        }
        const iframe = document.getElementById(target);
        if (iframe && iframe.tagName.toLowerCase() === 'iframe') {
            iframe.src = finalUrl;
        } else {
            console.warn(`LinkController: No iframe found with id="${target}". Opening in new tab.`);
            window.open(finalUrl, '_blank', 'noopener');
        }
    }
}
// ---- AUTO-GENERATED EXPORTS (Whakerexa bundle) ----
if (typeof window.Wexa !== 'object') { window.Wexa = {}; }
window.Wexa.LinkController = LinkController;
// ---- END AUTO-GENERATED EXPORTS ----


// ---------------- wexa.js ---------------
// --- Debug -------------------------------------------------------
console.debug('Imports OK:', {
    OnLoadManager,
    WexaLogger,
    AccessibilityManager,
    MenuManager,
    DialogManager,
    LinkController,
    SortaTable,
    ToggleSelector,
    ProgressBar,
    Book,
    BaseManager,
    RequestManager
});
// ----- Exports (framework public API) -----
// ---------------------------------------------------------------------------
// Global namespace for Whakerexa.
//
// This namespace exposes:
// - Singletons: framework-level managers that must exist exactly once.
// - Classes: reusable components that applications can instantiate freely.
//
// This unified API ensures consistency between ES6 module usage and the
// bundled (non-module) version. Applications can safely rely on Wexa.*
// regardless of whether modules are loaded or the bundle is used.
// ---------------------------------------------------------------------------
window.Wexa = Object.assign(window.Wexa || {}, {
    // ---------------------------------------------------------------
    // Singletons (global services)
    // ---------------------------------------------------------------
    // Logger is a class with only static methods → no cost / no instance.
    logger: WexaLogger,
    // Note: OnLoadManager is not instantiated because it is a scheduler /
    // dispatcher whose methods are static or utility-like.
    onload: OnLoadManager,
    accessibility: new AccessibilityManager(),
    dialog: new DialogManager(),
    links: new LinkController(),
    // ---------------------------------------------------------------
    // Public classes (instantiable components)
    // ---------------------------------------------------------------
    WexaLogger,
    OnLoadManager,
    AccessibilityManager,
    DialogManager,
    LinkController,
    MenuManager,
    ProgressBar,
    ToggleSelector,
    SortaTable,
    Book,
    BaseManager,
    RequestManager
});
// Register the global onload handler so that all deferred load functions
// declared across Whakerexa modules are executed once the document is ready.
window.onload = () => {
    OnLoadManager.runLoadFunctions();
};