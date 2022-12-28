import { frontle } from "../../index.js";

export class f_pageLoader {
  static _instance = null;
  constructor() {
    if (f_pageLoader._instance) {
      return f_pageLoader._instance;
    }
    f_pageLoader._instance = this;
  }

  // state params
  #params = {};
  #pageCount = 0;

  // page status
  #pageOpening = false;
  #firstSetStateEvent = true;

  // event listeners
  #forwardListener = null;
  #backListener = null;

  // start
  start() {
    // parse params
    const params = this.#parseURL();

    // make state
    let state = null;
    if (history.state === null) {
      state = Object.assign(params, {
        f_p: params.f_p || frontle.env.defaultPage,
        f_u: true,
        f_c: 0,
      });
    } else state = history.state;

    // page open
    this.#pageOpen("replace", state);
  }

  // page open
  #pageOpen(stateSaveType, state) {
    try {
      // check page opening
      if (this.#pageOpening) return;

      // start page opening
      this.#pageOpening = true;

      // get state parameters
      this.#params = state;
      this.#pageCount = this.#params.f_c;

      // get state URL
      const stateURL = this.#stateURL(state);

      // set state
      stateSaveType === "push"
        ? history.pushState(state, null, stateURL)
        : history.replaceState(state, null, stateURL);

      // set state pop and push event
      this.#setStateEvent();

      // get page path name
      const pagePathName = this.#params.f_p.replace(/[^a-zA-Z0-9_]/gi, "");

      import(`../../../../../app/${pagePathName}/${pagePathName}.js`).then(
        (_main) => {
          // reset page
          this.#pageReset();

          // stop page opening
          this.#pageOpening = false;

          // filter params
          let filteredParams = JSON.parse(JSON.stringify(this.#params));
          if (filteredParams.f_u !== undefined) delete filteredParams.f_u;
          if (filteredParams.f_c !== undefined) delete filteredParams.f_c;

          // start page
          _main.default(filteredParams);
        }
      );
    } catch (e) {
      console.log("page not found: " + JSON.stringify(e));
    }
  }

  // page change by state
  #setStateEvent() {
    // loading once
    if (this.#firstSetStateEvent === false) return;
    this.#firstSetStateEvent = false;

    window.onpopstate = (event) => {
      // get state
      const state = event.state;

      // get changed page count
      const changedPageCount = Number(state.f_c);

      // if push state
      if (changedPageCount > this.#pageCount) this.#pushState(state);
      // if pop state
      else if (changedPageCount < this.#pageCount) this.#popState(state);
    };
  }
  async #pushState(state) {
    if (this.#pageOpening) history.back();
    else {
      if (
        this.#forwardListener === null ||
        (await this.#forwardListener()) === true
      ) {
        this.#pageOpen("replace", state);
      } else {
        history.back();
      }
    }
  }
  async #popState(state) {
    if (this.#pageOpening) history.forward();
    else {
      if (
        this.#backListener === null ||
        (await this.#backListener()) === true
      ) {
        this.#pageOpen("replace", state);
      } else {
        history.forward();
      }
    }
  }

  // page change by util
  pageMove(pageName, params = {}, displayParamsInURL = true) {
    // make state
    const state = Object.assign(params, {
      f_p: pageName,
      f_u: displayParamsInURL,
      f_c: this.#pageCount + 1,
    });

    // page open
    this.#pageOpen("push", state);
  }
  pageReplace(pageName, params = {}, displayParamsInURL = true) {
    // make state
    const state = Object.assign(params, {
      f_p: pageName,
      f_u: displayParamsInURL,
      f_c: this.#pageCount,
    });

    // page open
    this.#pageOpen("replace", state);
  }

  // util
  #parseURL() {
    let params = {};
    window.location.search.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function (str, key, value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    );

    return params;
  }
  #stateURL(params) {
    let urlParams = "";
    if (Boolean(params.f_u) === true)
      urlParams = this.#paramsToURLString(params);

    return `${location.protocol}//${location.host}${location.pathname}/../index.html?f_p=${params.f_p}${urlParams}`;
  }
  #paramsToURLString(params = {}) {
    let urlParams = "";

    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = params[key];

      switch (key.toLocaleLowerCase()) {
        case "f_p":
        case "f_u":
        case "f_c":
          continue;
      }

      urlParams += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }

    return urlParams;
  }
  #pageReset() {
    // reset event
    this.removeForwardListener();
    this.removeBackListener();

    // reset scroll
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  // event
  getBackListener() {
    return this.#backListener;
  }
  addBackListener(listener = () => {}) {
    this.#backListener = listener;
  }
  removeBackListener() {
    this.#backListener = null;
  }

  getForwardListener() {
    return this.#forwardListener;
  }
  addForwardListener(listener = () => {}) {
    this.#forwardListener = listener;
  }
  removeForwardListener() {
    this.#forwardListener = null;
  }
}
