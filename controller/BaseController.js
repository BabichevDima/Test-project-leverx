sap.ui.define(
  ["sap/ui/core/mvc/Controller", "dmitry/babichev/model/formatter"],
  function (Controller, formatter) {
    "use strict";

    return Controller.extend("dmitry.babichev.controller.BaseController", {
      formatter: formatter,

      navigate: function (sRoute, oParams) {
        this.getOwnerComponent().getRouter().navTo(sRoute, oParams);
      },

      /**
       * Open stores overview page button press event handler.
       */
      onNavToProductsOverview: function () {
        this.navigate("ProductsOverview");
      },

      /**
       * Register the view with the message manager.
       */
      onRegisterManager: function () {
        var oMessageManager = sap.ui.getCore().getMessageManager();
        oMessageManager.registerObject(this.getView(), true);
        this.getView().setModel(oMessageManager.getMessageModel(), "messages");
      },

      onCreateElementPress: function (sQuery) {
        var oView       = this.getView();
        var sQuerySlice = sQuery.slice(0, -1);

        if (!this.oDialog) {
          this.oDialog = sap.ui.xmlfragment(
            oView.getId(),
            `dmitry.babichev.view.fragments.Popup${sQuerySlice}`,
            this
          );
          oView.addDependent(this.oDialog);
        }

        this.oDialog.open();
      },
    });
  }
);
