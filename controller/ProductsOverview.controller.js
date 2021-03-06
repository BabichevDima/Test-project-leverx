sap.ui.define(
  [
    "dmitry/babichev/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterType",
    "sap/ui/core/Fragment",
  ],
  function (BaseController, Filter, FilterOperator, JSONModel, MessageToast, Sorter, FilterType, Fragment) {
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

        _setAppViewModelSort: function () {
          var oAppViewModel = new JSONModel({
            statusRadioButton:              false,
            activeStatusFilterOnName:       new Filter("Name", FilterOperator.Contains, ""),
            activeStatusFilterOnPrice:      new Filter("Price", FilterOperator.GT, ""),
            activeStatusFilterOnSupplier:   [new Filter("Supplier", FilterOperator.Contains, "")],
            activeStatusFilterOnRating:     [new Filter("Rating", FilterOperator.GT, "")],
            activeStatusFilterOnCategories: [],
            sortType: {
              Name:             "sort",
              Description:      "sort",
              Price:            "sort",
              ReleaseDate:      "sort",
              DiscontinuedDate: "sort",
              Supplier:         "sort",
              Rating:           "sort",
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

          this.navigate("ProductDetails", { productId: nProductId })
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
          var key           = bStatusButton ? 500 : "";

          oAppViewModel.setProperty('/activeStatusFilterOnPrice', new Filter("Price", FilterOperator.GT, key));

          this._jointFilter()
        },

        handleSelectionFinish: function (oEvent) {
          var selectedItems = oEvent.getParameter("selectedItems");
          var messageText   = "You selected: [ ";
          var aSuppliers    = [];

          for (var i = 0; i < selectedItems.length; i++) {
            messageText += "'" + selectedItems[i].getText() + "'";
            if (i != selectedItems.length - 1) {
              messageText += ", ";
            }
            aSuppliers.push(selectedItems[i].getText());
          }

          messageText += " ]";

          MessageToast.show(messageText, { width: "auto" });

          this._setFilterSelectOnJSONModal(aSuppliers);
        },

        _setFilterSelectOnJSONModal: function (aSuppliers) {
          var aFilters = aSuppliers.map((element) => {
            return new Filter("Supplier", FilterOperator.Contains, element)
          });

          var key           = aFilters.length ? aFilters : [new Filter("Supplier", FilterOperator.Contains, "")];
          var oAppViewModel = this.getView().getModel("appViewSort");
          oAppViewModel.setProperty('/activeStatusFilterOnSupplier', key);

          this._jointFilter()
        },

        onRatingChange: function (oEvent) {
          var nQuery        = oEvent.getParameter("value");
          var key           = nQuery ? [new Filter("Rating", FilterOperator.EQ, nQuery)] : [];
          var oAppViewModel = this.getView().getModel("appViewSort");

          oAppViewModel.setProperty('/activeStatusFilterOnRating', key);
          this._jointFilter()
        },

        _jointFilter: function(){
          var oProductsList                  = this.byId("ProductsTable");
          var oItemsBinding                  = oProductsList.getBinding("items");
          var oAppViewModel                  = this.getView().getModel("appViewSort");
          var activeStatusFilterOnName       = oAppViewModel.getProperty('/activeStatusFilterOnName');
          var activeStatusFilterOnPrice      = oAppViewModel.getProperty('/activeStatusFilterOnPrice');
          var activeStatusFilterOnSupplier   = oAppViewModel.getProperty('/activeStatusFilterOnSupplier');
          var activeStatusFilterOnRating     = oAppViewModel.getProperty('/activeStatusFilterOnRating');
          var activeStatusFilterOnCategories = oAppViewModel.getProperty('/activeStatusFilterOnCategories');
          var aAllFilters                    = [];

          if(activeStatusFilterOnSupplier.length > 1){
            var jointFilterSupplier = new Filter({
              filters: [ ...activeStatusFilterOnSupplier ],
              and: false
            });

            aAllFilters = [activeStatusFilterOnName, activeStatusFilterOnPrice, ...activeStatusFilterOnRating, jointFilterSupplier, activeStatusFilterOnCategories];

          } else {
            aAllFilters = [activeStatusFilterOnName, activeStatusFilterOnPrice, ...activeStatusFilterOnRating, ...activeStatusFilterOnSupplier, activeStatusFilterOnCategories];
          }

          var jointFilter = new Filter({
            filters: aAllFilters,
            and: true
          });

          oItemsBinding.filter(jointFilter, FilterType.Application);
        },

        onDialogClosePress: function() {
          this.oDialog.close();
        },

        onValueHelpRequest: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue();
          var oView       = this.getView();

          if (!this._pValueHelpDialog) {
            this._pValueHelpDialog = Fragment.load({
              id: oView.getId(),
              name: "dmitry.babichev.view.fragments.ValueHelpDialog",
              controller: this
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }
          this._pValueHelpDialog.then(function(oDialog) {
            oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
            oDialog.open(sInputValue);
          });
        },

        onValueHelpSearch: function (oEvent) {
          var sValue  = oEvent.getParameter("value");
          var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
    
          oEvent.getSource().getBinding("items").filter([oFilter]);
        },
    
        onValueHelpClose: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem");
          oEvent.getSource().getBinding("items").filter([]);
    
          if (!oSelectedItem) {
            return;
          }
    
          this.byId("productInput").setValue(oSelectedItem.getTitle());

          var sValue = this.byId("productInput").getValue();
 
          this.filteredOnCategories(sValue)
        },

        handleLiveChangeCategories: function(oEvent){
          var sQuery = oEvent.getParameter("value");

          this.filteredOnCategories(sQuery)
        },

        filteredOnCategories: function(sQuery){
          var oAppViewModel = this.getView().getModel("appView");
          var aCategories   = oAppViewModel.getProperty('/Categories');

          var aFilters = aCategories.map((elem)=>{
            return new Filter(`Categories/${elem.Id}/Name`, FilterOperator.Contains, sQuery)
          })

          var oFilters = new Filter({
            filters: aFilters,
            and: false
          });

          var oAppViewModelSort = this.getView().getModel('appViewSort');
          oAppViewModelSort.setProperty('/activeStatusFilterOnCategories', oFilters);
          this._jointFilter()
        },
      }
    );
  }
);
