const selectedItems = tabUsers.getSelectedItems();

if (selectedItems) {
    selectedItems.forEach((item) => {
        const context = item.getBindingContext("SurveyMaster");
        const data = context.getObject();
        formBuilder.deleteUsers(data.id);
    });
}
