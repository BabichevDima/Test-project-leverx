sap.ui.define(
  [
    "dmitry/babichev/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    'sap/ui/model/FilterType'
  ],
  function (BaseController, Filter, FilterOperator, JSONModel, MessageToast, Sorter, FilterType) {
    "use strict";

    return BaseController.extend(
      "dmitry.babichev.controller.ProductsOverview ",
      {
        /**
         * Controller's "init" lifecycle method.
         */
        onInit: function () {
          this._setAppViewModelSort();
          this.onRegisterManager();
        },

        // _setAppViewModel: function () {
        //   var oAppViewModel = new JSONModel({
        //     statusRadioButton: false,
        //     Products: [
        //       {
        //         Categories: [
        //           { Id: 0, Name: "Electronic" },
        //           { Id: 1, Name: "Headphones and headsets" },
        //           { Id: 2, Name: "Accessories" },
        //         ],
        //         ID: 1,
        //         Name: "YS inPods Pro Headphones",
        //         Description: "The main element",
        //         ReleaseDate: "1992-01-01",
        //         DiscontinuedDate: "2000-01-01",
        //         Rating: 1,
        //         Price: 300,
        //         Supplier: "YS",
        //         ProductDetail: "",
        //       },
        //       {
        //         Categories: [
        //           { Id: 0, Name: "Electronic" },
        //           { Id: 1, Name: "Headphones and headsets" },
        //           { Id: 3, Name: "Console" },
        //         ],
        //         ID: 2,
        //         Name: "LeverX",
        //         Description: "The main element",
        //         ReleaseDate: "1972-01-01",
        //         DiscontinuedDate: "2022-01-01",
        //         Rating: 5,
        //         Price: 9000,
        //         Supplier: "bla-bla",
        //         ProductDetail: "",
        //       },
        //     ],
        //   });

        //   this.getView().setModel(oAppViewModel, "appView");
        // },
        _setAppViewModelSort: function () {
          var oAppViewModel = new JSONModel({
            statusRadioButton: false,
            activeStatusFilterOnName: new Filter("Name", FilterOperator.Contains, ""),
            activeStatusFilterOnPrice: new Filter("Price", FilterOperator.GT, ""),
            sortType: {
              Name: "sort",
              Description: "sort",
              Price: "sort",
              ReleaseDate: "sort",
              DiscontinuedDate: "sort",
              Supplier: "sort",
              Rating: "sort",
            },
          });
  
          this.getView().setModel(oAppViewModel, "appViewSort");
        },

        onSortButtonPress: function (sProperty) {
          var oSortFilterModel  = this.getView().getModel("appViewSort");
          var oSorter           = "";
          var sSortType         = oSortFilterModel.getProperty("/sortType");
          var oProductsTable    = this.byId("ProductsTable");
          var oItemsBinding     = oProductsTable.getBinding("items");
  
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

        onProductPress: function (oEvent) {
          var nProductId = oEvent.getSource().getBindingContext("appView").getObject("ID");
          this.getOwnerComponent().getRouter().navTo("ProductDetails", { productId: nProductId });
        },

        handleLiveChangeName: function (oEvent) {
          var oAppViewModel = this.getView().getModel('appViewSort');
          var sQuery        = oEvent.getParameter("value");

          oAppViewModel.setProperty('/activeStatusFilterOnName', new Filter("Name", FilterOperator.Contains, sQuery));

          this._jointFilter()
        },

        onSelectCheckBox: function () {
          var oAppViewModel = this.getView().getModel("appViewSort");
          var bStatusButton = oAppViewModel.getProperty("/statusRadioButton");
          var nQuery        = 500;
          var key           = bStatusButton ? nQuery : "";

          oAppViewModel.setProperty('/activeStatusFilterOnPrice', new Filter("Price", FilterOperator.GT, key));

          this._jointFilter()
        },

        _jointFilter: function(){
          var oProductsList             = this.byId("ProductsTable");
          var oItemsBinding             = oProductsList.getBinding("items");
          var oAppViewModel             = this.getView().getModel("appViewSort");
          var activeStatusFilterOnName  = oAppViewModel.getProperty('/activeStatusFilterOnName');
          var activeStatusFilterOnPrice = oAppViewModel.getProperty('/activeStatusFilterOnPrice');

          var jointFilter = new Filter({
            filters: [activeStatusFilterOnName, activeStatusFilterOnPrice],
            and: true
          });
  
          oItemsBinding.filter(jointFilter, FilterType.Application);
        },

        handleSelectionFinish: function (oEvent) {
          var selectedItems = oEvent.getParameter("selectedItems");
          var messageText   = "Event 'selectionFinished': [";
          var aSuppliers    = [];

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
