sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'dmitry/babichev/model/formatter',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/ui/core/ValueState',
    'sap/m/Dialog',
    'sap/m/DialogType',
    'sap/m/Button',
    'sap/m/ButtonType',
    'sap/m/Text'
  ],
  function(
    Controller,
    formatter,
    MessageToast,
    MessageBox,
    ValueState,
    Dialog,
    DialogType,
    Button,
    ButtonType,
    Text
  ) {
    'use strict';

    return Controller.extend('dmitry.babichev.controller.BaseController', {
      formatter: formatter,

      navigate: function(sRoute, oParams) {
        this.getOwnerComponent().getRouter().navTo(sRoute, oParams);
      },

      /**
			 * Open stores overview page button press event handler.
			 */
      onNavToStoresOverview: function() {
        this.navigate('ProductsOverview');
      },

      /**
			 * Validates the input object.
       * 
       * @param {Object} oNewElement delete type.
       * 
       * @returns {boolean} an object that stores the store id and product id.
			 */
      isCheckElement: function(oNewElement) {
        var flag = true;
        for (var key in oNewElement) {
          if (!oNewElement[key]) {
            return (flag = false);
          }
        }
        return flag;
      },

      /**
			 * Validates the input object.
       * 
       * @param {Object} oNewElement delete type.
       * 
       * @returns {boolean} boolean type.
			 */
      _parseRequestURL: function() {
        const url = location.hash.slice(2);
        const request = {};
        [
          request.store,
          request.storeId,
          request.product,
          request.productId
        ] = url.split('/');
        return request;
      },

      /**
			 * Deletes store or product.
			 *
			 * @param {Object} oCtx object binding context.
       * 
       * @param {string} query delete type.
			 */
      _onDeleteElement: function(oCtx, query) {
        var oODataModel = oCtx.getModel();
        var sKey = oODataModel.createKey(`/${query}`, oCtx.getObject());
        var querySlice = query.slice(0, -1);
        var i18n = this.getView().getModel('i18n').getResourceBundle();

        oODataModel.remove(sKey, {
          success: function() {
            MessageToast.show(
              `${querySlice} ` + i18n.getText('MessageDeleteSuccess')
            );
          },
          error: function() {
            MessageBox.error(
              i18n.getText('MessageDeleteError') + ` ${querySlice}!`
            );
          }
        });

        if (query === 'Stores') {
          this.onNavToStoresOverview();
        }
      },

      /**
			 * Asks for confirmation of deletion.
			 *
			 * @param {Object} oCtx object binding context.
       * 
       * @param {string} query delete type.
			 */
      onWarningMessageDialogPress: function(oCtx, query) {
        var i18n = this.getView().getModel('i18n').getResourceBundle();
        var querySlice = query.slice(0, -1);
        this.oWarningMessageDialog = new Dialog({
          type: DialogType.Message,
          title: i18n.getText('Warning'),
          state: ValueState.Warning,
          content: new Text({
            text: i18n.getText('WarningMessage') + ` ${querySlice}?`
          }),
          beginButton: new Button({
            type: ButtonType.Emphasized,
            text: 'OK',
            press: function() {
              this._onDeleteElement(oCtx, query);
              this.oWarningMessageDialog.close();
            }.bind(this)
          }),
          endButton: new Button({
            text: 'Cancel',
            press: function() {
              this.oWarningMessageDialog.close();
            }.bind(this)
          })
        });

        this.oWarningMessageDialog.open();
      },

      /**
       * Register the view with the message manager.
       */
      onRegisterManager: function() {
        var oMessageManager = sap.ui.getCore().getMessageManager();
        oMessageManager.registerObject(this.getView(), true);
        this.getView().setModel(oMessageManager.getMessageModel(), 'messages');
      },

      /**
			 * Opens dialog create element.
       * 
       * @param {string} sQuery create type.
			 */
      onCreateElementPress: function(sQuery) {
        var oView = this.getView();
        // var oODataModel = oView.getModel('oData');
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

      /**
			 * Creates element.
       * 
       * @param {string} sQuery create type.
			 */
      onDialogCreatePress: function(sQuery) {
        var oNewElement = this.oDialog.getBindingContext().getObject();
        var oODataModel = this.getView().getModel('oData');
        var sQuerySlice = sQuery.slice(0, -1);
        var i18n = this.getView().getModel('i18n').getResourceBundle();

        if (!this.isCheckElement(oNewElement)) {
          MessageToast.show(
            `${sQuerySlice} ` + i18n.getText('MessageCreateError')
          );
        } else {
          oODataModel.submitChanges();
          this.onDialogClosePress();
          MessageToast.show(
            `${sQuerySlice} ` + i18n.getText('MessageCreateSuccess')
          );
        }
      },

      /**
			 * "Cancel" button press event handler (in the dialog create element).
			 */
      onDialogClosePress: function() {
        var oODataModel = this.getView().getModel('oData');
        var oCtx = this.oDialog.getBindingContext();

        oODataModel.deleteCreatedEntry(oCtx);
        this.oDialog.close();
      }
    });
  }
);
