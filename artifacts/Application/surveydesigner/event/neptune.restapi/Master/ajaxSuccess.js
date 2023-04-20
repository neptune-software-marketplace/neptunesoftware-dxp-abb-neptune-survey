modelMasterData.refresh(true);

inFormGroup.destroyItems();
inFormGroup.addItem(new sap.ui.core.Item({ key: "", text: "" }));

$.each(modelMasterData.oData.groups, function (i, group) {
    inFormGroup.addItem(new sap.ui.core.Item({ key: group.id, text: group.name }));
});
