if (formBuilder.dataSaved !== modelSurveyMaster.getJSON()) {
    sap.m.MessageBox.confirm(
        "Data has been changed. Do you want to discard changes and continue without saving?",
        {
            icon: sap.m.MessageBox.Icon.WARNING,
            title: "Confirmation Needed",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            initialFocus: "No",
            onClose: function (sAction) {
                if (sAction === "YES") oApp.backToPage(pageSurveyList);
            },
        }
    );
} else {
    oApp.backToPage(pageSurveyList);
}
