sap.ui.define(
  [
    "dmitry/babichev/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (BaseController, Filter, FilterOperator, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend(
      "dmitry.babichev.controller.ProductsOverview ",
      {
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
              },
            ],
          });

          this.getView().setModel(oAppViewModel, "appView");
        },

        onProductPress: function (oEvent) {
          var oSource = oEvent.getSource();
          var oCtx = oSource.getBindingContext("appView");
          var oDataModel = oCtx.getObject();
          var nProductId = oEvent
            .getSource()
            .getBindingContext("appView")
            .getObject("ID");
          this.getOwnerComponent()
            .getRouter()
            .navTo("ProductDetails", { productId: nProductId });
        },

        handleLiveChangeName: function (oEvent) {
          var oProductsList = this.byId("ProductsTable");
          var oItemsBinding = oProductsList.getBinding("items");
          var sQuery = oEvent.getParameter("value");

          var oFilters = new Filter({
            filters: [new Filter("Name", FilterOperator.Contains, sQuery)],
            and: false,
          });

          oItemsBinding.filter(oFilters);
        },

        onSelectCheckBox: function () {
          var oProductsList = this.byId("ProductsTable");
          var oItemsBinding = oProductsList.getBinding("items");
          var oAppViewModel = this.getView().getModel("appView");
          var bStatusButton = oAppViewModel.getProperty("/statusRadioButton");
          var nQuery = 500;
          var key = bStatusButton ? nQuery : "";

          var oFilters = new Filter({
            filters: [new Filter("Price", FilterOperator.GT, key)],
            and: false,
          });

          oItemsBinding.filter(oFilters);
        },

        handleSelectionChange: function (oEvent) {
          var changedItem = oEvent.getParameter("changedItem");
          var isSelected = oEvent.getParameter("selected");

          var state = "Selected";
          if (!isSelected) {
            state = "Deselected";
          }

          MessageToast.show(
            "Event 'selectionChange': " +
              state +
              " '" +
              changedItem.getText() +
              "'",
            {
              width: "auto",
            }
          );
        },

        handleSelectionFinish: function (oEvent) {
          var selectedItems = oEvent.getParameter("selectedItems");
          var messageText = "Event 'selectionFinished': [";
          var aSuppliers = [];

          for (var i = 0; i < selectedItems.length; i++) {
            messageText += "'" + selectedItems[i].getText() + "'";
            if (i != selectedItems.length - 1) {
              messageText += ",";
            }

            aSuppliers.push(selectedItems[i].getText());
          }

          messageText += "]";

          MessageToast.show(messageText, {
            width: "auto",
          });


          this._onFilterSelect(aSuppliers);

        },

        _onFilterSelect: function (aSuppliers) {
          var oProductsList = this.byId("ProductsTable");
          var oItemsBinding = oProductsList.getBinding("items");
          
          var aFilters = aSuppliers.map((element) => {
            return new Filter("Supplier", FilterOperator.Contains, element)
          });

          var key = aFilters.length ? aFilters : "";

          var oFilters = new Filter({
            filters: key,
            and: false
          });

          oItemsBinding.filter(oFilters);
        },

        onRatingChange: function (oEvent) {
          var nQuery        = oEvent.getParameter("value");
          var oProductsList = this.byId("ProductsTable");
          var oItemsBinding = oProductsList.getBinding("items");
          var key           = nQuery ? nQuery : "";

          var oFilters = new Filter({
            filters: [new Filter("Rating", FilterOperator.EQ, key)],
            and: false,
          });

          oItemsBinding.filter(oFilters);

          console.log(nQuery);
        },

      }
    );
  }
);
