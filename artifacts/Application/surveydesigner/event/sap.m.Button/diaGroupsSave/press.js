apiGroupSave({
    data: modeldiaGroups.oData,
}).then(function (res) {
    apiMaster();
});

diaGroups.close();
