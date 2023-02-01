import { f_pageLoader } from "./system/page/pageloader.js";
const frotlePageLoader = new f_pageLoader();

const loadScript = (paths, callback) => {
  if (paths.length < 1) {
    callback();
    return;
  }

  const script = document.createElement("script");
  script.src = paths.shift();
  script.async = false;
  script.onload = () => {
    loadScript(paths, callback);
  };
  document.body.append(script);
};

/**
 * All features of Frontle are provided here
 */
const frontle = {
  /**
   * The area to manage events
   */
  event: {
    /**
     * The area to manage the event that occurs when the back button is pressed
     */
    back: {
      /**
       * Get the function to be executed when the back button is pressed
       * @returns {function}
       */
      getListener: () => {
        return frotlePageLoader.getBackListener();
      },

      /**
       * Register a function to be executed when the back button is pressed
       * @param {function} listener - Function to be executed when the back button is pressed
       */
      addListener: (listener) => {
        frotlePageLoader.addBackListener(listener);
      },

      /**
       * Delete the function to be executed when the back button is pressed
       */
      removeListener: () => {
        frotlePageLoader.removeBackListener();
      },
    },

    /**
     * The area to manage the event that occurs when the forward button is pressed
     */
    forward: {
      /**
       * Get the function to be executed when the forward button is pressed
       * @returns {function}
       */
      getListener: () => {
        return frotlePageLoader.getForwardListener();
      },

      /**
       * Register a function to be executed when the forward button is pressed
       * @param {function} listener - Function to be executed when the forward button is pressed
       */
      addListener: (listener) => {
        frotlePageLoader.addForwardListener(listener);
      },

      /**
       * Delete the function to be executed when the forward button is pressed
       */
      removeListener: () => {
        frotlePageLoader.removeForwardListener();
      },
    },
  },

  /**
   * The area to provide functions of Frontle
   */
  util: {
    /**
     * Go to another page
     * @param {string} pageName - Page name to go to
     * @param {object} [params] - Parameters to pass
     * @param {boolean} [displayParamsInURL] - Whether to display parameters in URL
     */
    pageMove: (pageName, params = {}, displayParamsInURL = true) => {
      frotlePageLoader.pageMove(pageName, params, displayParamsInURL);
    },

    /**
     * Go to another page. Can't go back to previous page
     * @param {string} pageName - Page name to go to
     * @param {object} [params] - Parameters to pass
     * @param {boolean} [displayParamsInURL] - Whether to display parameters in URL
     */
    pageReplace: (pageName, params = {}, displayParamsInURL = true) => {
      frotlePageLoader.pageReplace(pageName, params, displayParamsInURL);
    },
  },

  /**
   * The area to manage the functions used by the Frontle system
   */
  system: {
    /**
     * Run the Frontle system
     * @param {function} [deviceReadyCallback] - A function that is executed when the device is ready
     */
    start: (deviceReadyCallback = () => {}) => {
      loadScript(
        [
          "@/browser_modules/@frontle/frontle-core/system/xhrMiddleware.js",
          "../cordova.js",
        ],
        () => {
          let eventName = "deviceready";
          if (String(typeof window.cordova) === "undefined") {
            eventName = "DOMContentLoaded";
          }

          document.addEventListener(eventName, async () => {
            await deviceReadyCallback();
            frotlePageLoader.start();
          });
        }
      );
    },
  },

  /**
   * The area to manage the environment
   */
  env: {
    /**
     * Values ​​that can be set with the command "frontle build --fenv <FRONTLE_ENV>"
     */
    /* #FRONTLE_BUILD_LINE: FRONTLE_ENV */ FRONTLE_ENV: null,
    defaultPage: "main",
    /* #FRONTLE_BUILD_LINE: version */ version: "version",
  },
};

export { frontle };
