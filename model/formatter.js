sap.ui.define([], function() {
  'use strict';
  return {
    statusProductColor: function(sStatus) {
      switch (sStatus) {
        case 'OK':
          return 7;
        case 'STORAGE':
          return 1;
        case 'OUT_OF_STOCK':
          return 3;
        default:
          return sStatus;
      }
    }
  };
});
