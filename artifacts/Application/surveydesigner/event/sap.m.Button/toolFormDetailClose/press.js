if (formBuilder.dataSaved !== modelSurveyData.getJSON()) {

    sap.m.MessageBox.confirm("Data has been changed. Do you want to discard changes and continue without saving?", {
        icon: sap.m.MessageBox.Icon.WARNING,
        title: "Confirmation Needed",
        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
        initialFocus: "No",
        onClose: function (sAction) {
            if (sAction === "YES") oApp.backToPage(pageFormList);
        }
    });

} else {
    oApp.backToPage(pageFormList);
}