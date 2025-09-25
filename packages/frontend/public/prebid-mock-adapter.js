(function () {
  window.pbjs = window.pbjs || { que: [], adUnits: [] };

  function ensureQueue() {
    if (!window.pbjs.que) {
      window.pbjs.que = [];
    }
  }

  ensureQueue();

  window.pbjs.addAdUnits = function (units) {
    this.adUnits = this.adUnits.concat(units);
  };

  window.pbjs.removeAdUnit = function (code) {
    this.adUnits = this.adUnits.filter(function (unit) {
      return unit.code !== code;
    });
  };

  window.pbjs.requestBids = function ({ bidsBackHandler, timeout }) {
    var self = this;
    var simulatedTimeout = timeout || 700;

    setTimeout(function () {
      var responses = self.adUnits.map(function (unit) {
        var hasBid = Math.random() > 0.25;
        return {
          adUnitCode: unit.code,
          cpm: hasBid ? Number((Math.random() * 2 + 0.5).toFixed(2)) : 0,
          creative: hasBid
            ? '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#111827;color:white;font-family:sans-serif;font-size:16px">AI Mock Bidder - ' +
              unit.code +
              '</div>'
            : null,
          timeout: !hasBid
        };
      });

      bidsBackHandler(responses);
    }, simulatedTimeout);
  };
})();
