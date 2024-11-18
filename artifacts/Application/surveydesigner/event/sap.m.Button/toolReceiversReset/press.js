const selectedItems = tabReceivers.getSelectedIndices();

const receivers = [];

if (selectedItems) {
    selectedItems.forEach(function (index, i) {
        const context = tabReceivers.getContextByIndex(index);
        const data = context.getObject();
        formBuilder.resetReceivers(data.id);
    });
}
