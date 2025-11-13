(() => {
  // dom-loader.js
  var OnLoadManager2 = class _OnLoadManager {
    // FIELDS
    static #functions = [];
    // PUBLIC STATIC METHODS
    /**
     * Appends the given function to the list of functions to call during the onload event.
     * 
     * @param func the function to call during the onload event.
     */
    static addLoadFunction(func) {
      _OnLoadManager.#functions.push(func);
    }
    /**
     * Calls all functions added.
     * This function has to be called in the 'window.onload' event.
     */
    static runLoadFunctions() {
      _OnLoadManager.#functions.forEach(async (func) => {
        await func();
      });
    }
  };
  window.OnLoadManager = OnLoadManager2;
  window.onload = () => {
    OnLoadManager2.runLoadFunctions();
  };

  // logger.js
  var WexaLogger = class {
    static #logLevel = 20;
    /**
     * Get the current log level.
     *
     * @returns {number} The current log level (0–50).
     */
    static getLogLevel() {
      return this.#logLevel;
    }
    /**
     * Set the global log level for Whakerexa logging.
     *
     * @param {number} level - A value between 0 and 50.
     * @returns {void}
     */
    static setLogLevel(level) {
      if (typeof level !== "number" || level < 0 || level > 50) {
        console.warn("[WexaWarning] Invalid log level. Must be between 0 and 50.");
        return;
      }
      this.#logLevel = level;
    }
    /**
     * Log a debug message if level <= 10.>
     *
     * @param {string} msg - Message to display.
     * @returns {void}
     */
    static debug(msg) {
      if (this.#logLevel <= 10)
        console.info(`[WexaDebug] ${msg}`);
    }
    /**
     * Log an informational message if level <= 20.>
     *
     * @param {string} msg - Message to display.
     * @returns {void}
     */
    static info(msg) {
      if (this.#logLevel <= 20)
        console.info(`[WexaInfo] ${msg}`);
    }
    /**
     * Log a warning message if level <= 30.
     *
     * @param {string} msg - Message to display.
     * @returns {void}
     */
    static warn(msg) {
      if (this.#logLevel <= 30)
        console.warn(`[WexaWarning] ${msg}`);
    }
    /**
     * Log an error message if level <= 40.
     *
     * @param {string} msg - Message to display.
     * @param {Error|string} [err] - Optional associated error.
     * @returns {void}
     */
    static error(msg, err) {
      if (this.#logLevel <= 40)
        console.error(`[WexaError] ${msg}`, err || "");
    }
    /**
     * Log a critical message whatever the level.
     *
     * @param {string} msg - Message to display.
     * @param {Error|string} [err] - Optional associated error.
     * @returns {void}
     */
    static critical(msg, err) {
      console.error(`[WexaCritical] ${msg}`, err || "");
    }
  };
  window.WexaLogger = WexaLogger;

  // transport/request.js
  var RequestManager = class {
    // FIELDS
    // The declaration outside the constructor and the '#' symbol notify a private attribute.
    #protocol;
    #port;
    #url;
    #status;
    maxFileSize;
    // CONSTRUCTOR
    /**
     * The constructor of the RequestManager class.
     * Initialize private member attributes.
     */
    constructor() {
      this.#protocol = window.location.protocol;
      this.#port = window.location.port;
      this.#url = this.#protocol + "//" + window.location.hostname + ":" + this.#port + "/";
      this.#status = null;
      this.maxFileSize = 0;
    }
    // ----------------------------------------------------------------------
    // GETTERS
    // ----------------------------------------------------------------------
    /**
     * Get the protocol of the connexion of the client (In the SPPAS web application case the protocol is 'http').
     *
     * @returns {string} The protocol used.
     *
     */
    get protocol() {
      return this.#protocol;
    }
    // ----------------------------------------------------------------------
    /**
     * Get the port of the client and server address.
     *
     * @returns {string} - The port used.
     *
     */
    get port() {
      return this.#port;
    }
    // ----------------------------------------------------------------------
    /**
     * Get the url of the client and server address.
     *
     * Format: {protocol}://{hostname}:{port}/
     * Example: http://localhost:8080/
     *
     * @returns {string} The url of the localhost address.
     *
     */
    get request_url() {
      return this.#url;
    }
    // ----------------------------------------------------------------------
    /**
     * Get the status of the last response of the server.
     *
     * @returns {int} The code of the response.
     *
     */
    get status() {
      return this.#status;
    }
    // ----------------------------------------------------------------------
    // METHODS
    // ----------------------------------------------------------------------
    /**
     * This method is used to send a GET HTTP request to the python server.
     *
     * @param uri {string} - The pathname of the GET request.
     * @param is_json_response {boolean} - False by default.
     *                                     Boolean value to know if the server response is a json object to parse.
     *
     * @returns {Promise<*>} - The server data response.
     *
     */
    async send_get_request(uri = "", is_json_response = false) {
      const complete_url = this.request_url + uri;
      let request_response_data = null;
      await fetch(complete_url).then(async (response) => {
        this.#status = response.status;
        if (is_json_response) {
          request_response_data = await response.json();
        } else {
          request_response_data = await response.text();
        }
      }).catch((error) => {
        this.#status = error.status;
        request_response_data = error;
      });
      return request_response_data;
    }
    // ----------------------------------------------------------------------
    /**
     * Sends a POST HTTP request to the server, posting data in JSON format.
     *
     * Manages both JSON and Blob responses, and opens HTML error pages (like
     * 500 errors) in a new tab if encountered.
     *
     * @param {Object} post_parameters - Data to be sent in the POST request, in JSON format.
     * @param {string} [accept_type="application/json"] - Expected MIME type of the server's response, defaults to JSON.
     * @param {string} [uri=""] - Additional path to append to the base request URL.
     * @returns {Promise<*>} - Returns the parsed response data (JSON or Blob), or an error object.
     * @throws {Error} - Throws an error if there is a network or if an HTML error page is received.
     *
     */
    async send_post_request(post_parameters, accept_type = "application/json", uri = "") {
      const complete_url = this.request_url + uri;
      let request_response_data = null;
      post_parameters = JSON.stringify(post_parameters);
      let request_header = {
        "Accept": accept_type,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": post_parameters.length.toString()
      };
      await fetch(complete_url, {
        method: "POST",
        headers: request_header,
        body: post_parameters
      }).then(async (response) => {
        this.#status = response.status;
        if (accept_type.includes("application/json")) {
          const text = await response.text();
          if (text.trim() === "") {
            request_response_data = {};
          } else {
            try {
              request_response_data = JSON.parse(text);
            } catch (error) {
              console.error("Failed to parse JSON response", error);
              request_response_data = {
                status: response.status,
                error: "Failed to parse JSON. See error details in the newly opened tab.",
                html: text
              };
              this.openErrorTab(text);
            }
          }
        } else if (accept_type.includes("text/html")) {
          const responseText = await response.text();
          request_response_data = {
            status: response.status,
            error: "Received HTML instead of JSON. See error details in the newly opened tab.",
            html: responseText
          };
          this.openErrorTab(responseText);
        } else {
          request_response_data = await response.blob();
        }
      }).catch((error) => {
        this.#status = error.status;
        request_response_data = error;
      });
      return request_response_data;
    }
    // ----------------------------------------------------------------------
    /**
     * This function opens a new tab to display the HTML error content received from the server.
     * It is used when the server returns HTML content, typically in error cases.
     *
     * @param responseText {string} - The HTML response text to display in the new tab.
     */
    openErrorTab(responseText) {
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
    /**
     * Uploads a file (only one) from an input to the server.
     * Returns the server response in json format (already decoded).
     *
     * @param input {HTMLInputElement} - the input that contains the file to upload
     * @param accept_type {string} - mimetype of the server response, json by default.
     * @param token {string} - the token of the user to authenticate the request
     * @param uri {string} - The pathname of the GET request.
     *
     * @returns {Promise<*>} The server response.
     *
     */
    async upload_file(input, accept_type = "application/json", token = "", uri = "") {
      let response_data = null;
      const complete_url = this.request_url + uri;
      this.#status = 400;
      if (!input || !input.files || !input.files[0]) {
        console.warn("No file selected for upload.");
        return { error: "No file or empty file selected for upload." };
      }
      console.debug("Defined size limit: ", this.maxFileSize);
      console.debug("File size to upload: ", input.files[0].size);
      if (this.maxFileSize !== 0 && input.files[0].size > this.maxFileSize) {
        console.error("File size exceeds maximum of ${this.maxFileSize} bytes.");
        return { error: "File size exceeds maximum allowed length." };
      }
      let sanitizedFileName = input.files[0].name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let sanitizedFile = new File([input.files[0]], sanitizedFileName, {
        type: input.files[0].type,
        lastModified: input.files[0].lastModified
      });
      let data = new FormData();
      data.append("file", sanitizedFile);
      await fetch(complete_url, {
        method: "POST",
        headers: {
          "Accept": accept_type,
          "X-Auth-Token": "Bearer " + token
        },
        body: data
      }).then(async (response) => {
        console.debug(" ... server answer: ", response);
        this.#status = response.status;
        if (response.status !== 200 && !response.error) {
          response_data = { "error": response.statusText };
        } else {
          response_data = await response.json();
        }
      }).catch((error) => {
        console.error(" ... server error: ", error);
        this.#status = error.status;
        response_data = error;
      });
      return response_data;
    }
  };
  window.RequestManager = RequestManager;

  // transport/base_manager.js
  var BaseManager = class {
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
    }
    // ----------------------------------------------------------------------
    /**
     * Display an error or info message, and/or reloads the page.
     *
     * Handles the result of an action by checking the status of the request. If the
     * request was unsuccessful (status code not 200), an error message is displayed.
     * Otherwise, an optional info message is shown. If `reload` is set to true, the page
     * is reloaded after displaying the message.
     * The messages are displayed in a <dialog> element if available, or in an alert box otherwise.
     *
     * HTML Requirement:
     *  - A <dialog> element with id="error_dialog" to display error messages.
     *  - A <dialog> element with id="info_dialog" to display info messages.
     *
     * @param {string} [error="No details"] - The error message to display if a request fails.
     * @param {string} [info=""] - An optional info message to display upon success.
     * @param {boolean} [reload=true] - Whether to reload the page if no error occurred.
     *
     * @returns {void}
     *
     */
    _showActionResult(error = "", info = "", reload = true) {
      if (this._requestManager.status !== 200) {
        WexaLogger.error(`HTTP error ${this._requestManager.status}: ${error}`);
        this._showDialog("error_dialog", `Erreur ${this._requestManager.status} : ${error}`);
      } else {
        if (info) {
          WexaLogger.info(info);
          this._showDialog("info_dialog", info);
        }
        if (reload) {
          window.location.reload();
        }
      }
    }
    // ----------------------------------------------------------------------
    /**
    * Submit a temporary hidden form using HTTP POST.
    *
    * This method programmatically creates a `<form>` element containing a single
    * hidden `<input>` field, posts it to the current page URI, and relies on the
    * browser to handle the HTTP navigation and render the new page. It is mainly
    * used for actions that require a full page reload.
    *
    * @param {string} inputName - Name attribute of the hidden input field.
    * @param {string} inputValue - Value to assign to the hidden input field.
    * @returns {void}
    */
    submitForm(inputName, inputValue) {
      const form = document.createElement("form");
      form.method = "POST";
      form.style.display = "none";
      const input = document.createElement("input");
      input.name = inputName;
      input.value = inputValue;
      input.type = "hidden";
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
    // ----------------------------------------------------------------------
    /**
    * Send an asynchronous POST request to the server and return its response.
    *
    * This method sends event data to the server using the internal
    * RequestManager instance. If the server returns an error, it displays
    * the corresponding message; otherwise, it returns the parsed response.
    *
    * @async
    * @param {Object} events - Key/value pairs describing the events to send.
    * @returns {Object|undefined} The server response if successful, or
    *                             undefined if an error occurred.
    */
    async postEvents(events) {
      let response;
      let respError = "";
      let respInfo = "";
      try {
        response = await this._requestManager.send_post_request(
          events,
          "application/json",
          this._uri
        );
        WexaLogger.debug(`HTTP status ${this._requestManager.status}`);
        respError = response.error || "";
        respInfo = response.info || "";
      } catch (error) {
        respError = error.toString();
      }
      if (respError || respInfo) {
        this._showActionResult(respError, "", true);
        return;
      }
      return response;
    }
    // ----------------------------------------------------------------------
    /**
     * Display a message in a <dialog> element if it exists, or falls back to an alert.
     *
     * This function searches for a <dialog> element by its ID. If found, it inserts the
     * provided message inside the dialog and opens it. If the dialog is not found, it
     * displays the message using a browser alert.
     *
     * @param {string} dialogId - The ID of the <dialog> element to display the message in.
     * @param {string} message - The message to display in the dialog or alert.
     *
     * @returns {void}
     *
     */
    _showDialog = (dialogId, message) => {
      let dlg = document.getElementById(dialogId);
      if (dlg != null) {
        dlg.innerHTML = `<p>${message}</p>`;
        DialogManager.open(dialogId);
      } else {
        alert(message);
      }
    };
    // ----------------------------------------------------------------------
    /**
     * Hide a <dialog> element if it exists.
     *
     * This function searches for a <dialog> element by its ID. If found, it deletes the
     * existing message inside the dialog and closes it.
     *
     * @param {string} dialogId - The ID of the <dialog> element to display the message in.
     *
     * @returns {void}
     *
     */
    _hideDialog = (dialogId) => {
      let dlg = document.getElementById(dialogId);
      if (dlg != null) {
        dlg.innerHTML = ``;
        DialogManager.close(dialogId);
      } else {
        WexaLogger.warn(`No such dialog ${dialogId}`);
      }
    };
  };
  window.BaseManager = BaseManager;

  // accessibility.js
  var AccessibilityManager = class _AccessibilityManager extends BaseManager {
    // -----------------------------------------------------------------------
    // FIELDS
    // -----------------------------------------------------------------------
    #colors;
    #activated_color;
    #contrasts;
    #activated_contrast;
    // -----------------------------------------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------------------------------------
    /**
    * Create a new AccessibilityManager instance.
    *
    * This constructor initializes default color and contrast schemes,
    * sets their active values to empty (light and no-contrast by default),
    * and registers two onload functions:
    * 1. `#load_body_classes()` – applies color and contrast settings from URL parameters.
    * 2. `#set_all_links_custom()` – ensures internal links preserve accessibility parameters.
    *
    * @constructor
    * @returns {AccessibilityManager} A new accessibility manager instance.
    */
    constructor() {
      super();
      this.#colors = ["dark"];
      this.#activated_color = "";
      this.#contrasts = ["contrast"];
      this.#activated_contrast = "";
      OnLoadManager.addLoadFunction(this.#loadBodyClasses.bind(this));
      OnLoadManager.addLoadFunction(this.#setAllLinksCustom.bind(this));
      OnLoadManager.addLoadFunction(this.#setSubmitCustom.bind(this));
    }
    // -----------------------------------------------------------------------
    // GETTERS
    // -----------------------------------------------------------------------
    /**
     * Get all color schemes register in the class.
     * By default, contains only 'dark' (the 'light' mode is the default scheme when no scheme is set).
     *
     * @returns {Array[string]}
     */
    get colorSchemes() {
      return this.#colors;
    }
    // -----------------------------------------------------------------------
    /**
     * Get the current color scheme activated.
     * If this value is an empty string, then it's the default (light) mode which is activated.
     *
     * @returns {string}
     */
    get activatedColorScheme() {
      return this.#activated_color;
    }
    // -----------------------------------------------------------------------
    /**
     * Get all contrast schemes register in the class.
     * By default, contains only 'contrast'.
     *
     * @returns {Array[string]}
     */
    get contrastSchemes() {
      return this.#contrasts;
    }
    // -----------------------------------------------------------------------
    /**
     * Get the current contrast scheme activated.
     * If this value is an empty string, then it's the default (no-contrast) mode which is activated.
     *
     * @returns {string}
     */
    get activatedContrastScheme() {
      return this.#activated_contrast;
    }
    // -----------------------------------------------------------------------
    // SETTERS
    // -----------------------------------------------------------------------
    /**
     * Add a new color scheme to the registered list.
     *
     * This method registers a custom color scheme that can later be applied
     * through `activateColorScheme()`. The provided name must correspond to a
     * CSS class that overrides the color variables used by the `<body>` element.
     *
     * @param {string} colorScheme - The name of the new color scheme (CSS class name).
     * @returns {void}
     */
    addColorScheme(colorScheme) {
      if (typeof colorScheme === "string") {
        this.#colors.push(colorScheme);
      } else {
        console.log("The 'colorScheme' parameter must be a string, not a: " + typeof colorScheme);
      }
    }
    // -----------------------------------------------------------------------
    /**
     * Remove a color scheme from the registered list.
     *
     * This method deletes a specific color scheme name from the internal list
     * if it exists. If the provided name is invalid or not found, a warning
     * message is logged.
     *
     * @param {string} colorScheme - The name of the color scheme to remove.
     * @returns {void}
     */
    removeColorScheme(colorScheme) {
      if (typeof colorScheme !== "string") {
        console.log("The 'colorScheme' parameter must be a string, not a: " + typeof colorScheme);
      }
      const colorIndex = this.#colors.indexOf(colorScheme);
      if (colorIndex === -1) {
        console.log("The color scheme '" + colorScheme + "' does not exist!");
      } else {
        this.#colors.splice(colorIndex, 1);
      }
    }
    // -----------------------------------------------------------------------
    /**
     * Add a new contrast scheme to the registered list.
     *
     * This method registers a custom contrast scheme that can later be applied
     * through `activateContrastScheme()`. The given name must correspond to a CSS
     * class defining the contrast variables usable by the `<body>` element.
     *
     * @param {string} contrastScheme - The name of the contrast scheme to add.
     * @returns {void}
     */
    addContrastScheme(contrastScheme) {
      if (typeof contrastScheme === "string") {
        this.#contrasts.push(contrastScheme);
      } else {
        console.log("The 'contrastScheme' parameter must be a string, not a: " + typeof contrastScheme);
      }
    }
    // -----------------------------------------------------------------------
    /**
     * Remove a contrast scheme from the registered list.
     *
     * This method deletes a specific contrast scheme name from the internal list
     * if it exists. If the provided name is invalid or unknown, a warning message
     * is logged.
     *
     * @param {string} contrastScheme - The name of the contrast scheme to remove.
     * @returns {void}
     */
    removeContrastScheme(contrastScheme) {
      if (typeof contrastScheme !== "string") {
        console.log("The 'contrastScheme' parameter must be a string, not a: " + typeof contrastScheme);
      }
      const contrastIndex = this.#contrasts.indexOf(contrastScheme);
      if (contrastIndex === -1) {
        console.log("The contrast scheme '" + contrastScheme + "' does not exist!");
      } else {
        this.#contrasts.splice(contrastIndex, 1);
      }
    }
    // -----------------------------------------------------------------------
    // PUBLIC STATIC METHODS
    // -----------------------------------------------------------------------
    static get COLOR_PARAMETER_NAME() {
      return "wexa_color";
    }
    static get CONTRAST_PARAMETER_NAME() {
      return "wexa_contrast";
    }
    // -----------------------------------------------------------------------
    // PUBLIC METHODS
    // -----------------------------------------------------------------------
    /**
     * DEPRECATED.
     * @returns {Promise<void>}
     */
    async switch_color_scheme() {
      await this.switchColorScheme();
    }
    /**
    * Toggle between the default (light) and the configured color scheme.
    *
    * This method switches the color mode when only one color scheme is registered.
    * If multiple color schemes exist, it logs a warning and requires using
    * `activate_color_scheme()` instead. The method updates the `<body>` element’s
    * CSS class, refreshes the visual state of the theme button, and informs the
    * server of the current color scheme through a POST event.
    *
    * @async
    * @returns {Promise<void>}
    */
    async switchColorScheme() {
      if (this.#colors.length > 1) {
        console.log("Impossible to switch color scheme because multiple color schemes has set !You have to use the activate_color_scheme() method!");
      }
      if (this.#activated_color === "") {
        this.#activated_color = this.#colors[0];
        document.body.classList.add(this.#colors[0]);
      } else {
        this.#activated_color = "";
        document.body.classList.remove(this.#colors[0]);
      }
      this.#updateButtonState("btn-theme");
      await this.postEvents({ "accessibility_color": this.#activated_color });
    }
    // -----------------------------------------------------------------------
    /**
    * DEPRECATED.
    * @param {string} color_scheme - Name of the color scheme to activate.
    * @returns {Promise<void>}
    */
    async activate_color_scheme(color_scheme) {
      await this.activateColorScheme(color_scheme);
    }
    /**
    * Activate a specific color scheme on the current page.
    *
    * This method applies the selected color theme by updating the `<body>` class
    * and removing any previously active color. It synchronizes the chosen scheme
    * with the server using a POST event, ensuring that both client and server
    * maintain a consistent accessibility state.
    *
    * @async
    * @param {string} colorScheme - The name of the color scheme to apply
    *                               (e.g., 'dark', 'light', or custom name).
    * @returns {Promise<void>}
    */
    async activateColorScheme(colorScheme) {
      if (colorScheme === "" || this.#colors.includes(colorScheme)) {
        if (this.#activated_color !== "") {
          document.body.classList.remove(this.#activated_color);
        }
        if (colorScheme !== "") {
          document.body.classList.add(colorScheme);
        }
        this.#activated_color = colorScheme;
        await this.postEvents({ "accessibility_color": this.#activated_color });
      } else {
        console.log("Unknown given color scheme: " + colorScheme);
      }
    }
    // -----------------------------------------------------------------------
    /**
     * DEPRECATED.
     * @returns {Promise<void>}
     */
    async switch_contrast_scheme() {
      await this.switchContrastScheme();
    }
    /**
     * Toggle between the default (no-contrast) and the configured contrast scheme.
     *
     * This method switches the contrast mode when only one contrast scheme is registered.
     * If multiple contrast schemes exist, it logs a warning and requires using
     * `activateContrastScheme()` instead. The method updates the `<body>` element’s
     * CSS class, refreshes the visual state of the contrast button, and notifies
     * the server of the current contrast mode via a POST event.
     *
     * @async
     * @returns {Promise<void>}
     */
    async switchContrastScheme() {
      if (this.#contrasts.length > 1) {
        console.log("Impossible to switch contrast scheme because multiple contrast schemes are set! Use activateContrastScheme() instead.");
      }
      if (this.#activated_contrast === "") {
        this.#activated_contrast = this.#contrasts[0];
        document.body.classList.add(this.#contrasts[0]);
      } else {
        this.#activated_contrast = "";
        document.body.classList.remove(this.#contrasts[0]);
      }
      this.#updateButtonState("btn-contrast");
      await this.postEvents({ accessibility_contrast: this.#activated_contrast });
    }
    // -----------------------------------------------------------------------
    /**
     * DEPRECATED.
     * @param {string} contrast_scheme - Name of the contrast scheme to activate.
     * @returns {Promise<void>}
     */
    async activate_contrast_scheme(contrast_scheme) {
      await this.activateContrastScheme(contrast_scheme);
    }
    /**
     * Activate a specific contrast scheme on the current page.
     *
     * This method applies or removes the given contrast mode by updating the `<body>`
     * element’s class and synchronizes the resulting accessibility state with the
     * server through a POST event. If the provided scheme is unknown, a warning is logged.
     *
     * @async
     * @param {string} contrastScheme - The name of the contrast scheme to apply.
     *                                  An empty value disables contrast mode.
     * @returns {Promise<void>}
     */
    async activateContrastScheme(contrastScheme) {
      if (contrastScheme === "" || this.#contrasts.includes(contrastScheme)) {
        if (this.#activated_contrast !== "") {
          document.body.classList.remove(this.#activated_contrast);
        }
        if (contrastScheme !== "") {
          document.body.classList.add(contrastScheme);
        }
        this.#activated_contrast = contrastScheme;
        const response = await this.postEvents({ accessibility_contrast: this.#activated_contrast });
      } else {
        console.log("Unknown given contrast scheme: " + contrastScheme);
      }
    }
    // -----------------------------------------------------------------------
    /**
     * Redirect the client while preserving accessibility parameters.
     *
     * This method customizes internal link navigation to ensure that color and
     * contrast schemes are preserved across pages. If the target URL points to an
     * external domain, the redirection occurs without modification. For internal
     * links, accessibility parameters are appended to the URL before navigation.
     *
     * @param {HTMLAnchorElement} element - The `<a>` element containing the target URL.
     * @returns {void}
     */
    goToLink(element) {
      if (element.host !== window.location.host) {
        document.location.href = element.href;
        return;
      }
      document.location.href = this.setUrlWithParameters(element.href);
    }
    // -----------------------------------------------------------------------
    /**
     * Append accessibility parameters (color and contrast) to a given URL.
     *
     * This method constructs a new URL that includes GET parameters reflecting
     * the current accessibility state. If a parameter is inactive (empty), it is
     * removed from the query string. External links should not be processed by
     * this method.
     *
     * @param {string} url - The URL to modify.
     * @returns {string} The updated URL containing accessibility parameters.
     */
    setUrlWithParameters(url) {
      const customUrl = new URL(url);
      if (this.#activated_color !== "") {
        customUrl.searchParams.set(_AccessibilityManager.COLOR_PARAMETER_NAME, this.#activated_color);
      } else {
        customUrl.searchParams.delete(_AccessibilityManager.COLOR_PARAMETER_NAME);
      }
      if (this.#activated_contrast !== "") {
        customUrl.searchParams.set(_AccessibilityManager.CONTRAST_PARAMETER_NAME, this.#activated_contrast);
      } else {
        customUrl.searchParams.delete(_AccessibilityManager.CONTRAST_PARAMETER_NAME);
      }
      return customUrl.href;
    }
    // -----------------------------------------------------------------------
    // PRIVATE METHODS
    // -----------------------------------------------------------------------
    /**
     * Load and apply accessibility classes from the current URL.
     *
     * This private asynchronous method reads `wexa_color` and `wexa_contrast`
     * parameters from the query string and applies the corresponding CSS classes
     * to the `<body>` element. It updates the internal state of the manager and,
     * if valid parameters were found, sends a single POST event to the server to
     * synchronize accessibility settings (color and contrast).
     *
     * This function is automatically executed on page load to restore the user's
     * accessibility preferences and ensure visual consistency across sessions.
     *
     * @private
     * @async
     * @returns {Promise<void>}
     */
    async #loadBodyClasses() {
      const params = new URLSearchParams(window.location.search);
      const events = {};
      if (params.has(_AccessibilityManager.COLOR_PARAMETER_NAME)) {
        const color_parameter = params.get(_AccessibilityManager.COLOR_PARAMETER_NAME).toLowerCase();
        if (this.#colors.includes(color_parameter)) {
          this.#activated_color = color_parameter;
          document.body.classList.add(color_parameter);
          events.accessibility_color = this.#activated_color;
        } else {
          console.log(_AccessibilityManager.COLOR_PARAMETER_NAME + " get parameter unknown : " + color_parameter);
        }
      }
      if (params.has(_AccessibilityManager.CONTRAST_PARAMETER_NAME)) {
        const contrast_param = params.get(_AccessibilityManager.CONTRAST_PARAMETER_NAME).toLowerCase();
        if (this.#contrasts.includes(contrast_param)) {
          this.#activated_contrast = contrast_param;
          document.body.classList.add(contrast_param);
          events.accessibility_contrast = this.#activated_contrast;
        } else {
          console.log(_AccessibilityManager.CONTRAST_PARAMETER_NAME + " get parameter unknown : " + contrast_param);
        }
      }
      if (Object.keys(events).length > 0) {
        await this.postEvents(events);
      }
    }
    // -----------------------------------------------------------------------
    /**
     * Custom the click event of all 'a' html element to call the goToLink function.
     */
    #setAllLinksCustom() {
      let link_elements = Array.from(document.querySelectorAll("a"));
      link_elements.forEach((element) => {
        element.addEventListener("click", (event) => {
          event.preventDefault();
          this.goToLink(element);
        });
      });
    }
    // -----------------------------------------------------------------------
    /**
     * Customize the main form submission to preserve accessibility parameters.
     *
     * This private method attaches a click listener to the first submit button
     * found in the document. When triggered, it rewrites the form’s `action`
     * attribute using `setUrlWithParameters()` so that the current color and
     * contrast schemes remain applied after submission.
     *
     * This behavior ensures continuity of the accessibility context between pages
     * without requiring any manual script injection.
     *
     * @private
     * @returns {void}
     */
    #setSubmitCustom() {
      const submitButton = document.querySelector('button[type="submit"]');
      if (!submitButton)
        return;
      submitButton.addEventListener("click", () => {
        const form = document.querySelector("form");
        if (form) {
          form.action = this.setUrlWithParameters(form.action);
        }
      });
    }
    // -----------------------------------------------------------------------
    /**
     * Update the visual pressed state of a specific accessibility button.
     * @private
     * @param {string} buttonId - 'btn-contrast' or 'btn-theme'.
     */
    #updateButtonState(buttonId) {
      const btn = document.getElementById(buttonId);
      if (btn === null) {
        console.error(`Button not found: ${buttonId}.`);
        return;
      }
      let pressed = false;
      if (buttonId === "btn-contrast") {
        pressed = this.#activated_contrast !== "";
      } else if (buttonId === "btn-theme") {
        pressed = this.#activated_color !== "";
      } else {
        console.error(`Unknown button id: ${buttonId}.`);
        return;
      }
      btn.setAttribute("aria-pressed", String(pressed));
    }
  };
  window.AccessibilityManager = new AccessibilityManager();

  // menu.js
  var SubMenuManager = class {
    // --------------------------------------------------------------------
    // Protected members
    // --------------------------------------------------------------------
    #asideElement;
    #menuLinks;
    _focusTrapHandler;
    // --------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------
    /**
     * Create a SubMenuManager instance.
     *
     * @param {string} asideId - ID of the aside element containing the submenu.
     */
    constructor(asideId = "appmenu") {
      this.#asideElement = document.getElementById(asideId);
      this.#menuLinks = this.#asideElement ? this.#asideElement.querySelectorAll("a, button") : [];
      this._focusTrapHandler = this.#trapFocus.bind(this);
    }
    // --------------------------------------------------------------------
    // Public methods
    // --------------------------------------------------------------------
    /**
     * Open the submenu and manage its internal focus state.
     *
     * @returns {void}
     */
    openSubmenu() {
      this.#setOpenState(true);
    }
    // --------------------------------------------------------------------
    /**
     * Close the submenu and disable focus trapping.
     *
     * @returns {void}
     */
    closeSubmenu() {
      this.#setOpenState(false);
    }
    // --------------------------------------------------------------------
    // Private methods
    // --------------------------------------------------------------------
    /**
     * Define the open or closed state of the submenu.
     *
     * When opened, tabindex values are enabled and focus is trapped
     * within the submenu. When closed, all links become unfocusable.
     *
     * @private
     * @param {boolean} open - True to open the submenu, false to close it.
     * @returns {void}
     */
    #setOpenState(open) {
      if (this.#asideElement === null)
        return;
      const opened = open === true;
      this.#asideElement.classList.toggle("open", opened);
      this.#setLinksTabIndex(opened ? 0 : -1);
      if (opened === true) {
        document.addEventListener("keydown", this._focusTrapHandler, true);
        const onTransitionEnd = (ev) => {
          if (["left", "right", "top", "bottom"].includes(ev.propertyName)) {
            this.#menuLinks[0]?.focus();
            this.#asideElement.removeEventListener("transitionend", onTransitionEnd);
          }
        };
        this.#asideElement.addEventListener("transitionend", onTransitionEnd);
      } else {
        document.removeEventListener("keydown", this._focusTrapHandler, true);
      }
      this.#adjustSubmenuPosition();
      this.#adjustSubmenuAlignment();
    }
    // --------------------------------------------------------------------
    /**
     * Read CSS variable '--appmenu-position' and update the data attribute.
     *
     * @private
     * @returns {void}
     */
    #adjustSubmenuPosition() {
      const position = getComputedStyle(this.#asideElement).getPropertyValue("--appmenu-position").trim();
      this.#asideElement.setAttribute("data-submenu-position", position || "left");
      this.#asideElement.offsetHeight;
    }
    // --------------------------------------------------------------------
    /**
     * Read CSS variable '--appmenu-align' and update alignment attributes.
     *
     * @private
     * @returns {void}
     */
    #adjustSubmenuAlignment() {
      const align = getComputedStyle(this.#asideElement).getPropertyValue("--appmenu-align").trim();
      const [horizontal = "center", vertical = "center"] = align.split(" ");
      this.#asideElement.setAttribute("data-submenu-align-horizontal", horizontal);
      this.#asideElement.setAttribute("data-submenu-align-vertical", vertical);
      this.#asideElement.offsetHeight;
    }
    // --------------------------------------------------------------------
    /**
     * Trap focus inside the submenu when the Tab key is pressed.
     *
     * @private
     * @param {KeyboardEvent} e - The keyboard event.
     * @returns {void}
     */
    #trapFocus(e) {
      if (e.key !== "Tab")
        return;
      const focusable = Array.from(this.#menuLinks);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    // --------------------------------------------------------------------
    /**
     * Set tabindex for each submenu link.
     *
     * @private
     * @param {number} value - Tabindex value (-1 to disable, 0 to enable).
     * @returns {void}
     */
    #setLinksTabIndex(value) {
      for (const link of this.#menuLinks) {
        link.tabIndex = value;
      }
    }
  };
  var MenuManager = class _MenuManager {
    // --------------------------------------------------------------------
    // Protected members
    // --------------------------------------------------------------------
    // The '<nav>' element this class is managing
    #navElement;
    // A dictionary of registered submenus: each key is the submenu
    // identifier, and the value is its associated toggle button element.
    #submenus = /* @__PURE__ */ new Map();
    // --------------------------------------------------------------------
    // Public members
    // --------------------------------------------------------------------
    static DEFAULT_NAV_ID = "nav-content";
    // ----------------------------------------------------------------------
    /**
     * Creates a manager bound to a specific <nav>.
     *
     * @param {string} [navId=MenuManager.DEFAULT_NAV_ID] - ID of the <nav> to control.
     * @throws {Error} If the <nav> element cannot be found.
     */
    constructor(navId = _MenuManager.DEFAULT_NAV_ID) {
      this.#navElement = document.getElementById(navId);
      if (!this.#navElement) {
        throw new Error(`MenuManager: nav with id '${navId}' not found.`);
      }
      this.#submenus = /* @__PURE__ */ new Map();
      const sideMenu = this.#navElement.matches(".side") ? this.#navElement : null;
      if (sideMenu) {
        sideMenu.addEventListener("mouseenter", () => {
          for (const [
            submenu
            /* toggle */
          ] of this.#submenus) {
            submenu.closeSubmenu();
          }
        });
      }
      document.addEventListener("click", (e) => this.#handleBodyClick(e), true);
    }
    // ----------------------------------------------------------------------
    /**
     * Register a submenu and its toggle button.
     *
     * @param {string} asideId - ID of the submenu <aside> element.
     * @param {string} toggleButtonId - ID of the button controlling this submenu.
     * @returns {void}
     */
    registerSubmenu(asideId, toggleButtonId) {
      const aside = document.getElementById(asideId);
      const toggle = document.getElementById(toggleButtonId);
      if (aside === null || toggle === null) {
        WexaLogger.warn(`MenuManager: Invalid submenu registration: '${asideId}'.`);
        return;
      }
      const submenu = new SubMenuManager(asideId);
      this.#submenus.set(submenu, toggle);
      this.#initToggleAttributes(toggle, asideId);
      this.#bindToggleEvents(submenu, toggle);
    }
    // ----------------------------------------------------------------------
    /**
     * Initializes pin/unpin behavior for a side menu.
     *
     * This handles the click on the "pin menu" button to expand/collapse
     * the side navigation bar, updating ARIA attributes accordingly.
     *
     * @param {string} navSelector - CSS selector of the side nav element.
     * @param {string} pinButtonId - ID of the pin/unpin button.
     * @returns {void}
     */
    initSideMenu(navSelector = "nav#nav-content.side.collapsible", pinButtonId = "pin-menu") {
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
      pinBtn.addEventListener("click", () => {
        const isPinned = nav.classList.toggle("expanded");
        nav.setAttribute("aria-pinned", isPinned ? "true" : "false");
        pinBtn.setAttribute("aria-pressed", String(isPinned));
        pinBtn.setAttribute("aria-label", isPinned ? "Unpin menu" : "Pin menu");
      });
    }
    // ----------------------------------------------------------------------
    /**
     * Initialize mobile menu toggle behavior.
     *
     * Link the hidden checkbox, navigation container, and visible menu button.
     * Ensure synchronization between checkbox state and ARIA attributes.
     *
     * @param {string} checkboxId - ID of the controlling checkbox.
     * @param {string} buttonId - ID of the visible menu button.
     * @returns {void}
     */
    initMobileToggle(checkboxId = "mobile", buttonId = "menu-button") {
      const checkbox = document.getElementById(checkboxId);
      const button = document.getElementById(buttonId);
      if (checkbox === null || button === null) {
        WexaLogger.warn("MenuManager: Missing elements for mobile toggle.");
        return;
      }
      checkbox.addEventListener("change", () => {
        this.#updateMobileState(checkbox, button);
      });
      button.addEventListener("click", () => {
        checkbox.checked = !checkbox.checked;
        this.#updateMobileState(checkbox, button);
      });
      this.#updateMobileState(checkbox, button);
    }
    // ----------------------------------------------------------------------
    // Private
    // ----------------------------------------------------------------------
    /**
     * Initialize ARIA attributes of a toggle button.
     *
     * @private
     * @param {HTMLElement} toggle - Toggle button element.
     * @param {string} asideId - ID of the associated submenu.
     */
    #initToggleAttributes(toggle, asideId) {
      toggle.setAttribute("aria-controls", asideId);
      toggle.setAttribute("aria-haspopup", "menu");
      toggle.setAttribute("aria-expanded", "false");
    }
    // ----------------------------------------------------------------------
    /**
     * Bind activation events for the toggle button.
     *
     * @private
     * @param {SubMenuManager} submenu - Associated submenu manager.
     * @param {HTMLElement} toggle - Toggle button element.
     */
    #bindToggleEvents(submenu, toggle) {
      const activate = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const pin = document.getElementById("pin-menu");
        const isPinned = pin !== null && pin.getAttribute("aria-pressed") === "true";
        if (isPinned === false) {
          this.#navElement.classList.remove("expanded");
          this.#navElement.setAttribute("aria-expanded", "false");
        }
        this.#closeOtherSubmenus(submenu);
        submenu.openSubmenu();
        toggle.setAttribute("aria-expanded", "true");
      };
      toggle.addEventListener("click", activate);
      toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ")
          activate(e);
      });
    }
    // ----------------------------------------------------------------------
    /**
     * Close all registered submenus except the given one.
     *
     * @private
     * @param {SubMenuManager} current - Submenu to keep open.
     */
    #closeOtherSubmenus(current) {
      for (const [submenu, toggle] of this.#submenus) {
        if (submenu !== current) {
          submenu.closeSubmenu();
          toggle.setAttribute("aria-expanded", "false");
        }
      }
    }
    // ----------------------------------------------------------------------
    /**
     * Handle clicks on the document body to close submenus.
     *
     * @private
     * @param {MouseEvent} event - The click event.
     * @returns {void}
     */
    #handleBodyClick(event) {
      const target = event.target;
      const insideNav = this.#navElement.contains(target);
      const insideAside = target.closest("aside.appmenu.open") !== null;
      if (insideNav || insideAside)
        return;
      for (const [submenu, toggle] of this.#submenus) {
        submenu.closeSubmenu();
        toggle.setAttribute("aria-expanded", "false");
      }
      this.#navElement.classList.remove("submenu-active");
    }
    // ----------------------------------------------------------------------
    /**
     * Update ARIA attributes and menu class for the mobile toggle.
     *
     * @private
     * @param {HTMLInputElement} checkbox - Checkbox controlling the menu.
     * @param {HTMLElement} button - Visible menu button.
     * @returns {void}
     */
    #updateMobileState(checkbox, button) {
      const expanded = checkbox.checked === true;
      this.#navElement.classList.toggle("expanded", expanded);
      this.#navElement.setAttribute("aria-expanded", String(expanded));
      button.setAttribute("aria-expanded", String(expanded));
    }
  };
  window.MenuManager = MenuManager;

  // dialog.js
  var DialogManager2 = class {
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
    /**
     * Create a new DialogManager instance.
     *
     * Initializes internal structures to store dialog references and defines
     * naming conventions for dialog and video identifiers.
     */
    constructor() {
      this.#dialogs = /* @__PURE__ */ new Map();
      this.#closeButtonName = "popup-close-btn";
      this.#videoPrefix = "popup-video-";
      this.#dialogPrefix = "popup-";
    }
    // --------------------------------------------------------------------
    // Public methods
    // --------------------------------------------------------------------
    /**
     * Open a dialog in standard or modal mode.
     *
     * This method mirrors the legacy `open_dialog()` behavior. It changes the CSS class
     * from 'hidden-alert' to 'hidden-alert-open', injects a close button if missing,
     * and displays the dialog either with `showModal()` or `show()`. The modal mode
     * blocks background interaction until the dialog is closed.
     *
     * @param {string} id - The identifier of the dialog element.
     * @param {boolean} [isModal=false] - Whether to display it as a modal dialog.
     */
    open(id, isModal = false) {
      const dialog = this.#getDialog(id);
      if (dialog === null)
        return;
      dialog.classList.replace("hidden-alert", "hidden-alert-open");
      this.#createCloseButton(dialog);
      if (isModal === true && typeof dialog.showModal === "function") {
        dialog.showModal();
      } else if (typeof dialog.show === "function") {
        dialog.show();
      } else {
        dialog.setAttribute("open", "");
      }
    }
    // --------------------------------------------------------------------
    /**
     * Close a dialog and restore its initial state.
     *
     * This method reproduces the legacy `close_dialog()` logic. It restores the hidden
     * class, removes the dynamically created close button, and calls the dialog’s native
     * `close()` method if available. It ensures that the dialog’s DOM structure is
     * always reset after closing.
     *
     * @param {string} id - The identifier of the dialog element.
     */
    close(id) {
      const dialog = this.#getDialog(id);
      if (dialog === null)
        return;
      dialog.classList.replace("hidden-alert-open", "hidden-alert");
      Array.from(dialog.children).forEach((child) => {
        if (child.name === this.#closeButtonName) {
          child.remove();
        }
      });
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
    // --------------------------------------------------------------------
    /**
     * Open a video popup and pre-load its content.
     *
     * This method replaces the legacy `play_popup_video()` function. It opens the
     * corresponding dialog in modal mode and triggers a short play/pause sequence to
     * force early loading of the video resource by the browser.
     *
     * @param {string} id - Popup identifier (without prefix).
     * @returns {Promise<void>}
     */
    async playVideo(id) {
      const popupId = this.#dialogPrefix + id;
      this.open(popupId, true);
      const video = document.getElementById(this.#videoPrefix + id);
      if (video === null) {
        WexaLogger.error(`DialogManager: video not found for '${id}'.`);
        return;
      }
      await video.play();
      video.pause();
    }
    // --------------------------------------------------------------------
    /**
     * Close the video popup and stop playback.
     *
     * This method mirrors the legacy `close_popup_video()` function. It closes the
     * corresponding dialog and ensures that the associated video is paused to free
     * browser resources and maintain consistent playback state.
     *
     * @param {string} id - Popup identifier (without prefix).
     */
    closeVideo(id) {
      const popupId = this.#dialogPrefix + id;
      this.close(popupId);
      const video = document.getElementById(this.#videoPrefix + id);
      if (video !== null) {
        video.pause();
      } else {
        WexaLogger.warn(`DialogManager: video not found for '${id}'.`);
      }
    }
    // --------------------------------------------------------------------
    // Private methods
    // --------------------------------------------------------------------
    /**
     * Get the dialog element and store it in cache.
     *
     * @private
     * @param {string} id - The dialog identifier.
     * @returns {HTMLDialogElement|null}
     */
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
    /**
     * Create and attach a close button to the dialog.
     *
     * @private
     * @param {HTMLDialogElement} dialog - The dialog element.
     */
    #createCloseButton(dialog) {
      if (dialog.querySelector(`button[name="${this.#closeButtonName}"]`) !== null) {
        return;
      }
      const btn = document.createElement("button");
      btn.name = this.#closeButtonName;
      btn.type = "button";
      btn.innerHTML = "&#10060;";
      btn.addEventListener("click", () => this.close(dialog.id));
      dialog.appendChild(btn);
    }
  };
  window.DialogManager = new DialogManager2();

  // links.js
  var LinkController = class {
    /**
     * Initialize a LinkController instance.
     * This class is self-contained and does not listen automatically.
     */
    constructor() {
    }
    // ----------------------------------------------------------------------
    /**
     * Attach event listeners to all elements whose ids are listed in `selectors`.
     *
     * Each valid element will respond to both mouse clicks and Enter key events,
     * invoking the internal `_handleActivation()` method.
     *
     * @param {string[]} selectors - List of element ids to be handled.
     * @returns {void}
     */
    handleLinks(selectors) {
      if (!Array.isArray(selectors)) {
        console.error("LinkController: Expected a list of element ids.");
        return;
      }
      for (const id of selectors) {
        const element = document.getElementById(id);
        if (element === null) {
          console.warn(`LinkController: No element found with id "${id}".`);
          continue;
        }
        element.removeEventListener("click", this._handleActivation);
        element.removeEventListener("keydown", this._handleActivation);
        element.addEventListener("click", (event) => this._handleActivation(event, element));
        element.addEventListener("keydown", (event) => this._handleActivation(event, element));
      }
    }
    // ----------------------------------------------------------------------
    /**
     * Handle a click or keydown (Enter) event and open the appropriate target.
     *
     * @param {Event} event - The event object.
     * @param {HTMLElement} element - The element that triggered the event.
     * @private
     */
    _handleActivation(event, element) {
      const isClick = event.type === "click";
      const isEnter = event.type === "keydown" && event.key === "Enter";
      if (!isClick && !isEnter) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const url = element.getAttribute("href") || element.dataset.href;
      if (!url) {
        console.warn(`LinkController: No URL defined for element id="${element.id}".`);
        return;
      }
      const target = element.dataset.target || "_blank";
      this._openUrl(url, target);
    }
    // ----------------------------------------------------------------------
    /**
     * Open the given URL according to the specified target.
     *
     * @param {string} url - The URL to open.
     * @param {string} target - The target mode: `_blank`, `_self`, or iframe id.
     * @private
     */
    _openUrl(url, target) {
      if (target === "_blank" || target === "_self") {
        window.open(url, target, "noopener");
        return;
      }
      const iframe = document.getElementById(target);
      if (iframe && iframe.tagName.toLowerCase() === "iframe") {
        iframe.src = url;
      } else {
        console.warn(`LinkController: No iframe found with id="${target}". Opening in new tab.`);
        window.open(url, "_blank", "noopener");
      }
    }
  };

  // wexa.js
  window.Wexa = { OnLoadManager: OnLoadManager2, WexaLogger, AccessibilityManager, MenuManager, DialogManager: DialogManager2, LinkController };
})();
