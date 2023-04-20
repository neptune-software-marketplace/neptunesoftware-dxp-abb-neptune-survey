const table = oEvent.getSource().getParent().getParent().getItems()[0];
table.fireEvent('change');

const context = oEvent.oSource.getBindingContext("SurveyData");
const data = context.getObject();
if (this.getSelectedKey()  === "noLimit" && data.required) {
    sap.m.MessageBox.confirm(
        "If you require an answer, total options cannot be 'No Limit'. Please change it in 'Select Total Options'",
        {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "Information",
            actions: [sap.m.MessageBox.Action.OK],
            initialFocus: "Ok",
        }
    );
    return this.setSelectedKey('equalTo');
}