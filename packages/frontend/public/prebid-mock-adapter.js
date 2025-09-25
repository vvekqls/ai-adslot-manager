(function () {
  var creativesByPlacement = {
    default: [
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#111827;color:#f3f4f6;font-family:sans-serif;font-size:16px">AI Mock Bidder — Performance Matters</div>',
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#0f766e;color:#ecfeff;font-family:sans-serif;font-size:16px">Predictive Bidding Co-Op</div>',
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1f2937;color:#bfdbfe;font-family:sans-serif;font-size:16px">Adaptive Yield Lab</div>'
    ],
    sidebar: [
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#3b0764;color:#ede9fe;font-family:sans-serif;font-size:16px">Premium Sidebar Spotlight</div>'
    ],
    hero: [
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#312e81;color:#eef2ff;font-family:sans-serif;font-size:18px">Front Page Sponsorship</div>'
    ]
  };

  function selectCreative(unit, index) {
    var placementKey = 'default';

    if (unit.mediaTypes && unit.mediaTypes.banner && unit.mediaTypes.banner.sizes) {
      var maxSize = unit.mediaTypes.banner.sizes.reduce(function (acc, size) {
        if (!acc) return size;
        if (size[0] * size[1] > acc[0] * acc[1]) {
          return size;
        }
        return acc;
      }, null);

      if (maxSize && maxSize[0] >= 970) {
        placementKey = 'hero';
      } else if (maxSize && maxSize[1] >= 600) {
        placementKey = 'sidebar';
      }
    }

    var pool = creativesByPlacement[placementKey] || creativesByPlacement.default;
    return pool[index % pool.length];
  }

  window.pbjs = window.pbjs || { que: [], adUnits: [] };

  if (!window.pbjs.que) {
    window.pbjs.que = [];
  }

  var impressionCounter = 0;

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
      var responses = self.adUnits.map(function (unit, index) {
        // Ensure at least every third request returns a miss so timeout recommendations can surface,
        // but guarantee the majority of slots render creatives for a richer demo.
        var missAuction = (impressionCounter + index + 1) % 6 === 0;
        var creative = missAuction ? null : selectCreative(unit, impressionCounter + index);

        return {
          adUnitCode: unit.code,
          cpm: creative ? Number((Math.random() * 2 + 0.5).toFixed(2)) : 0,
          creative: creative,
          timeout: missAuction
        };
      });

      impressionCounter += self.adUnits.length;

      bidsBackHandler(responses);
    }, simulatedTimeout);
  };
})();
