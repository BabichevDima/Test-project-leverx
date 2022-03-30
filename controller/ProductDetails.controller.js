sap.ui.define(
  [
    "dmitry/babichev/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/ui/model/FilterType",
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast,
    FilterType
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
       * Controller's lifecycle method. This method is called every time the View is rendered, after the HTML is placed in the DOM-Tree.
       *
       * This internal logic is responsible for counting the number of products depending on the active status.
       *
       */
      // onAfterRendering: function() {
      //   var oODataModel = this.getView().getModel('oData');
      //   var oProductsTable = this.byId('ProductsTable');
      //   var oBinding = oProductsTable.getBinding('items');
      //   var oAppView = this.getView().getModel('appView');

      //   oBinding.attachDataReceived(function() {
      //     var oCtx = oProductsTable.getBindingContext('oData');
      //     var sStoresPath = oODataModel.createKey('/Stores', oCtx.getObject());
      //     var aStatuses = ['ALL', 'OK', 'STORAGE', 'OUT_OF_STOCK'];

      //     aStatuses.forEach(function(sStatus) {
      //       var oParams = {
      //         success: function(sCount) {
      //           oAppView.setProperty(
      //             '/' + sStatus.toLowerCase() + 'ProductsCount',
      //             sCount
      //           );
      //         }
      //       };

      //       if (sStatus !== 'ALL') {
      //         oParams.filters = [
      //           new Filter('Status', FilterOperator.EQ, sStatus)
      //         ];
      //       }

      //       oODataModel.read(sStoresPath + '/rel_Products/$count', oParams);
      //     });
      //   });
      // },

      /**
       * "StoreDetails" route pattern matched event handler.
       *
       * @param {sap.ui.base.Event} oEvent event object.
       */
      _onPatternMatched: function(oEvent) {
        // var that = this;
        // var oODataModel = this.getView().getModel('oData');
        // this.sStoreId = oEvent.getParameter('arguments').storeId;

        // oODataModel.metadataLoaded().then(function() {
        //   var sKey = oODataModel.createKey('/Stores', { id: that.sStoreId });

        //   that.getView().bindObject({
        //     path: sKey,
        //     model: 'oData',
        //     mode: 'TwoWay'
        //   });
        // });

        // this.getView().setModel(oODataModel, 'oData');
      },

      /**
       * Creates a "view" model to store some technical/configuration stuff locally on the view.
       *
       */
      _setAppViewModel: function () {
        var oAppViewModel = new JSONModel({
          activeStatusFilter: new Filter("Status", FilterOperator.Contains, ""),
          sortType: {
            Name: 'sort'
          }
        });

        this.getView().setModel(oAppViewModel, "appViewSort");
      },

      /**
       * Open product page button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent event object
       *
       */
      // onNavProductDetailsPress: function (oEvent) {
      //   var nProductId = oEvent
      //     .getSource()
      //     .oBindingContexts.oData.getObject("id");

      //   this.navigate("ProductDetails", {
      //     storeId: this.sStoreId,
      //     productId: nProductId,
      //   });
      // },

      /**
       * "Search products" event handler of the "navigation buttons".
       *
       * @param {sap.ui.base.Event} oEvent event object.
       */
      // onFilterSelect: function (oEvent) {
      //   var oAppViewModel = this.getView().getModel("appView");
      //   var oProductsTable = this.byId("ProductsTable");
      //   var oItemsBinding = oProductsTable.getBinding("items");
      //   var key = oEvent.getParameter("key") !== "ALL" ? oEvent.getParameter("key") : "";

      //   oItemsBinding.filter(new Filter("Status", FilterOperator.Contains, key));
      //   oAppViewModel.setProperty("/activeStatusFilter", oItemsBinding.getFilters("Control")[0]);
      // },

      /**
       * "Search products" event handler of the "SearchField".
       *
       * @param {sap.ui.base.Event} oEvent event object.
       */
      onProductSearch: function (oEvent) {
        var oAppViewModel = this.getView().getModel("appView");
        var oProductsTable = this.byId("ProductsTable");
        var oItemsBinding = oProductsTable.getBinding("items");
        var sQuery = oEvent.getParameter("query");
        var activeStatusFilter = oAppViewModel.getProperty(
          "/activeStatusFilter"
        );

        var oFilters = new Filter({
          filters: [
            new Filter("Name", FilterOperator.Contains, sQuery),
            new Filter("Specs", FilterOperator.Contains, sQuery),
            new Filter("SupplierInfo", FilterOperator.Contains, sQuery),
            new Filter("MadeIn", FilterOperator.Contains, sQuery),
            new Filter(
              "ProductionCompanyName",
              FilterOperator.Contains,
              sQuery
            ),
          ],
          and: false,
        });

        if (!isNaN(sQuery)) {
          oFilters.aFilters.push(
            new Filter("Price", FilterOperator.EQ, +sQuery),
            new Filter("Rating", FilterOperator.EQ, +sQuery)
          );
        }

        var jointFilter = new Filter({
          filters: [activeStatusFilter, oFilters],
          and: true,
        });

        oItemsBinding.filter(jointFilter, FilterType.Application);
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
                oSortFilterModel.setProperty(
                  `/sortType/${elem}`,
                  "sort-ascending"
                );
                oSorter = new Sorter(sProperty, false);
                break;
              case "sort-ascending":
                oSortFilterModel.setProperty(
                  `/sortType/${elem}`,
                  "sort-descending"
                );
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

      /**
       * "Delete" store or product button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent event object
       *
       * @param {string} sQuery delete type.
       */
      onDeleteButtonPress: function (oEvent, sQuery) {
        var oCtx = oEvent.getSource().getBindingContext("oData");

        this.onWarningMessageDialogPress(oCtx, sQuery);
      },

      /**
       * "Open dialog edit product" button press event handler.
       *
       * @param {sap.ui.base.Event} oEvent event object
       */
      onEditProductButtonPress: function (oEvent) {
        var oView = this.getView();
        var oODataModel = oView.getModel("oData");
        var oCtx = oEvent.getSource().getBindingContext("oData");

        if (!this.oDialogEdit) {
          this.oDialogEdit = sap.ui.xmlfragment(
            oView.getId(),
            "dmitry.babichev.view.fragments.PopupEditProduct",
            this
          );
          oView.addDependent(this.oDialogEdit);
        }

        this.oDialogEdit.setBindingContext(oCtx);
        this.oDialogEdit.setModel(oODataModel);
        this.oDialogEdit.open();
      },

      /**
       * Dialog product edit "Save" button press event handler.
       */
      onEditDialogProductPress: function () {
        var oODataModel = this.getView().getModel("oData");
        var i18n = this.getView().getModel("i18n").getResourceBundle();

        if (oODataModel.hasPendingChanges()) {
          oODataModel.submitChanges();
          this.onEditDialogProductCancelPress();
          MessageToast.show(i18n.getText("ProductSuccessEdited"));
        } else {
          MessageToast.show(i18n.getText("ProductNotEdited"));
        }
      },

      /**
       * "Cancel" button press event handler (in the dialog product edit).
       */
      onEditDialogProductCancelPress: function () {
        var oODataModel = this.getView().getModel("oData");
        var oCtx = this.oDialogEdit.getBindingContext();

        oODataModel.deleteCreatedEntry(oCtx);
        this.oDialogEdit.close();
        oODataModel.refresh(true);
      },
    });
  }
);
