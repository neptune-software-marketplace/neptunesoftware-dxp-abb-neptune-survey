const selectedItems = tabSystemUsers.getSelectedItems();
let users = [];

selectedItems.forEach(function (selectedItem) {
    const context = selectedItem.getBindingContext("MasterData");
    users.push(context.getObject());
});

formBuilder.addUsers(users);
diaAddUsers.close();
