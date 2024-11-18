let binding = tabSurvey.getBinding('items');
let filter = new sap.ui.model.Filter({
    filters: [
        new sap.ui.model.Filter('name', 'Contains', this.getValue()),
        new sap.ui.model.Filter('description', 'Contains', this.getValue()),
        new sap.ui.model.Filter('updatedBy', 'Contains', this.getValue())
    ],
    and: false
})

if (pageSurveyListUser.getSelectedKey() === 'Mine') {
    let filter2 = new sap.ui.model.Filter('updatedBy', 'EQ', modelMasterData.oData.user.username);
    binding.filter([filter, filter2]);
} else {
    binding.filter([filter]);
}