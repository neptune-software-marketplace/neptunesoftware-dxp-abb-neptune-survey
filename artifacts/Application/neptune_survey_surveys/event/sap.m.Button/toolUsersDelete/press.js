const selectedItems = tabUsers.getSelectedIndices();

selectedItems.forEach(function (index, i) {
    const context = tabUsers.getContextByIndex(index);

    if (context) {
        const data = context.getObject();
        controller.deleteUsers(data.id);
    }
});
