(function (open) {
  XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
    if (url === "config.xml") url = "../config.xml";
    open.call(this, method, url, async, user, pass);
  };
})(XMLHttpRequest.prototype.open);
