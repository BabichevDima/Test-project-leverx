sap.ui.define(
  [
    "dmitry/babichev/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter
  ) {
    "use strict";

    return BaseController.extend("dmitry.babichev.controller.ProductDetails", {
      /**
       * Controller's "init" lifecycle method.
       */
      onInit: function () {
        this.onRegisterManager();
        this._setAppViewModel();
        this.getOwnerComponent()
          .getRouter()
          .getRoute("ProductDetails")
          .attachPatternMatched(this._onPatternMatched, this);
      },

      /**
       * "StoreDetails" route pattern matched event handler.
       *
       * @param {sap.ui.base.Event} oEvent event object.
       */
      _onPatternMatched: function (oEvent) {
        var sProductId  = +oEvent.getParameter("arguments").productId;
        var oAppView    = this.getView().getModel("appView");
        var aObject     = oAppView.getProperty("/Products");
        var object      = aObject.findIndex(elem => elem.ID == sProductId);

        this.getView().bindElement({
          path: `/Products/${object}`,
          model: 'appView'
        });
      },

      _setAppViewModel: function () {
        var oAppViewModel = new JSONModel({
          activeStatusFilter: new Filter("Status", FilterOperator.Contains, ""),
          sortType: {
            Name: "sort",
          },
        });

        this.getView().setModel(oAppViewModel, "appViewSort");
      },

      /**
       * "Sort products" button press event handler.
       *
       * @param {string} sProperty sorting type.
       */
      onSortButtonPress: function (sProperty) {
        var oSortFilterModel = this.getView().getModel("appViewSort");
        var oSorter = "";
        var sSortType = oSortFilterModel.getProperty("/sortType");
        var oProductsTable = this.byId("ProductsTable");
        var oItemsBinding = oProductsTable.getBinding("items");

        Object.keys(sSortType).forEach(function (elem) {
          if (sProperty === elem) {
            switch (sSortType[elem]) {
              case "sort":
                oSortFilterModel.setProperty(`/sortType/${elem}`, "sort-ascending");
                oSorter = new Sorter(sProperty, false);
                break;
              case "sort-ascending":
                oSortFilterModel.setProperty(`/sortType/${elem}`, "sort-descending");
                oSorter = new Sorter(sProperty, true);
                break;
              case "sort-descending":
                oSortFilterModel.setProperty(`/sortType/${elem}`, "sort");
                oSorter = "";
                break;
            }
          } else {
            oSortFilterModel.setProperty(`/sortType/${elem}`, "sort");
          }
        });

        oItemsBinding.sort(oSorter);
      },
    });
  }
);
