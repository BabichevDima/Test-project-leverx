sap.ui.define(
  [
    "dmitry/babichev/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, Filter, FilterOperator, JSONModel) {
    "use strict";

    return BaseController.extend("dmitry.babichev.controller.ProductsOverview ", {
      /**
       * Controller's "init" lifecycle method.
       */
      onInit: function () {
        this._setAppViewModel();
        this.onRegisterManager();
      },

      _setAppViewModel: function () {
        var oAppViewModel = new JSONModel({
          statusRadioButton: false,
          Products: [
            {
              Categories: [
                { Id: 0, Name: "Electronic" },
                { Id: 1, Name: "Headphones and headsets" },
                { Id: 2, Name: "Accessories" },
              ],
              ID: 1,
              Name: "YS inPods Pro Headphones",
              Description: "The main element",
              ReleaseDate: "1992-01-01",
              DiscontinuedDate: "2000-01-01",
              Rating: 1,
              Price: 300,
              Supplier: "YS",
              ProductDetail: "",
            },
            {
              Categories: [
                { Id: 0, Name: "Electronic" },
                { Id: 1, Name: "Headphones and headsets" },
                { Id: 3, Name: "Console" },
              ],
              ID: 2,
              Name: "LeverX",
              Description: "The main element",
              ReleaseDate: "1972-01-01",
              DiscontinuedDate: "2022-01-01",
              Rating: 5,
              Price: 9000,
              Supplier: "bla-bla",
              ProductDetail: "",
            }
          ],
        });

        this.getView().setModel(oAppViewModel, "appView");
      },

      /**
       * Open store page button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent event object
       *
       */
      onStorePress: function (oEvent) {
        var nStoreId = oEvent
          .getSource()
          .getBindingContext("appView")
          .getObject("ID");
        this.navigate("StoreDetails", { storeId: nStoreId });
      },

      /**
       *
       * @param {sap.ui.base.Event} oEvent event object.
       */
       handleLiveChangeName: function (oEvent) {
        var oProductsList = this.byId("ProductsTable");
        var oItemsBinding = oProductsList.getBinding("items");
        var sQuery = oEvent.getParameter("value");

        var oFilters = new Filter({
          filters: [
            new Filter("Name", FilterOperator.Contains, sQuery)
          ],
          and: false,
        });

        oItemsBinding.filter(oFilters);
      },

    });
  }
);
