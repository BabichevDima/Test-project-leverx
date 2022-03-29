sap.ui.define(
  [
    'dmitry/babichev/controller/BaseController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Sorter',
    'sap/m/MessageToast'
  ],
  function(
    BaseController,
    Filter,
    FilterOperator,
    JSONModel,
    Sorter,
    MessageToast
  ) {
    'use strict';

    var sProductId = null;
    var sMessage = '';
    return BaseController.extend('dmitry.babichev.controller.ProductDetails111', {
      /**
			 * Controller's "init" lifecycle method.
			 */
      onInit: function() {
        this._setAppViewModel();
        this.getOwnerComponent()
          .getRouter()
          .getRoute('ProductDetails')
          .attachPatternMatched(this._onPatternMatched, this);
      },

      /**
			 * "ProductDetails" route pattern matched event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
      _onPatternMatched: function(oEvent) {
        var that = this;
        var oODataModel = this.getView().getModel('oData');
        sProductId = oEvent.getParameter('arguments').productId;
        this.sStoreId = oEvent.getParameter('arguments').storeId;

        oODataModel.metadataLoaded().then(function() {
          var sKey = oODataModel.createKey(`/Products`, {
            id: sProductId
          });

          that.getView().bindObject({
            path: sKey,
            model: 'oData',
            mode: 'TwoWay'
          });
        });

        this.getView().setModel(oODataModel, 'oData');
        this._onFilterProductComments();
        this._onSetModelComment();
      },

      /**
			 * Creates JSON model for message to be displayed in field.
			 *
			 */
      _setAppViewModel: function() {
        var oAppViewModel = new JSONModel({
          Message: ''
        });
        this.getView().setModel(oAppViewModel, 'appView');
      },

      /**
			 * Filters and sorts comments based on product
			 *
			 */
      _onFilterProductComments: function() {
        var oCommentsList = this.byId('CommentsList');
        var oItemsBinding = oCommentsList.getBinding('items');

        oItemsBinding.filter(
          new Filter('ProductId', FilterOperator.EQ, sProductId)
        );
        oItemsBinding.sort(new Sorter('Posted', true));
      },

      /**
			 * Open store page button press event handler.
			 */
      onNavToStoreDetails: function() {
        this.navigate('StoreDetails', { storeId: this.sStoreId });
      },

      /**
			 * Creates a model for storing a comment
			 *
			 */
      _onSetModelComment: function() {
        var oView = this.getView();
        var oODataModel = oView.getModel('oData');

        var oEntryCtx = oODataModel.createEntry('/ProductComments', {
          properties: {
            Author: '',
            Message: sMessage,
            Rating: 0,
            Posted: new Date(),
            ProductId: sProductId
          }
        });

        this.getView().setBindingContext(oEntryCtx);
        this.getView().setModel(oODataModel);
      },

      /**
			 * Creates comment.
			 */
      onCreateCommentPress: function() {
        var oODataModel = this.getView().getModel('oData');
        var oCtx = this.byId('Author').getBindingContext();
        var i18n = this.getView().getModel('i18n').getResourceBundle();

        if (this.byId('Author').getValue() && this.byId('Rating').getValue()) {
          oODataModel.submitChanges();
          oODataModel.deleteCreatedEntry(oCtx);
          this._onSetModelComment();
          MessageToast.show(i18n.getText('CommentSuccessCreated'));
        } else {
          var sNewMessage = this.getView().getBindingContext().getObject()
            .Message;
          var oAppViewModel = this.getView().getModel('appView');
          new Promise(res => res()).then(() => {
            oAppViewModel.setProperty(`/Message`, sNewMessage);
            sMessage = oAppViewModel.getProperty('/Message');
            this._onSetModelComment();
            oODataModel.deleteCreatedEntry(oCtx);
          });
          MessageToast.show(i18n.getText('CommentNotCreated'));
        }
      }
    });
  }
);
