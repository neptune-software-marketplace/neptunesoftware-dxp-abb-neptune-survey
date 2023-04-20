jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.FileSizeFormat");
jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");
jQuery.sap.require("sap.m.MessageBox");

let dataSavedSurvey;
let events;

sap.ui.getCore().attachInit(function (startParams) {
    controller.init();
});

sap.n.Shell.attachBeforeDisplay(localAppID, function (startParams) {
    toolStartUpdate.firePress();
});
