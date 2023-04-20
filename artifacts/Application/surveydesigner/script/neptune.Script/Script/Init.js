jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.FileSizeFormat");
jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");
jQuery.sap.require("sap.m.MessageBox");

gridForm.setCustomLayout(
    new sap.ui.layout.cssgrid.GridBoxLayout({
        boxWidth: "30rem",
    })
);

let dataSavedSurvey;

sap.ui.getCore().attachInit(function (startParams) {
    modelSurveyData.setSizeLimit(5000);
    formBuilder.init();
});
