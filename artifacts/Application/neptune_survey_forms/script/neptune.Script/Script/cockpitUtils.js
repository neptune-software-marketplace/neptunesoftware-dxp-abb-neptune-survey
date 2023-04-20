const cockpitUtils = {
    isCockpit: false,
    dataSet: null,
    dataSaved: null,
    requiredFields: [],

    init: function () {
        if (sap.n && sap.n.Planet9) {
            cockpitUtils.isCockpit = true;
        } else {
            return;
        }

        // Format Buttons
        sap.n.Planet9.formatButtonEdit(butDetailSetEdit);
        sap.n.Planet9.formatButtonDisplay(butDetailSetDisplay);
        sap.n.Planet9.formatButtonSave(butDetailSave);
        sap.n.Planet9.formatButtonDelete(butDetailDelete);
        sap.n.Planet9.formatButtonBack(butDetailBack);

        // ReadOnly Mode
        cockpitUtils.toggleEdit(false);

        // Custom Code

        // Set Lockhandler Object Name
        cockpitUtils.dataSet = "Neptune SURVEY Form";

        // Required Fieldnames for data validation
        cockpitUtils.requiredFields = ["inpageFormDetailFormname"];
    },

    toggleEdit: function (editable) {
        if (!cockpitUtils.isCockpit) return;
        if (!editable) editable = false;

        butDetailSetEdit.setVisible(!editable);
        butDetailSetDisplay.setVisible(editable);

        modelappControl.oData.enableEdit = editable;
        modelappControl.refresh();

        if (modelSurveyData.oData.id && editable) {
            butDetailDelete.setVisible(true);
        } else {
            butDetailDelete.setVisible(false);
        }

        // Cockpit Action
        sap.n.Planet9.setToolbarButton(editable);
        sap.n.Planet9.requiredFieldsClear(cockpitUtils.requiredFields);
    },

    toggleCreate: function () {
        if (!cockpitUtils.isCockpit) return;

        butDetailSetEdit.setVisible(false);
        butDetailSetDisplay.setVisible(false);
        butDetailDelete.setVisible(false);

        modelappControl.oData.enableEdit = true;
        modelappControl.refresh();

        // Cockpit Action
        sap.n.Planet9.setToolbarButton(true);
        sap.n.Planet9.requiredFieldsClear(cockpitUtils.requiredFields);
    },

    lock: function () {
        oApp.setBusy(false);

        sap.n.Planet9.function({
            id: "Locking",
            method: "Lock",
            data: {
                objectType: cockpitUtils.dataSet,
                objectID: modelSurveyData.oData.id,
                objectKey: modelSurveyData.oData.name,
            },
            success: function (data) {
                oApp.setBusy(false);

                if (data.object) {
                    modeldiaLocked.setData(data.object);
                    sap.n.Planet9.lockCallback = butDetailSetEdit;
                    diaLocked.open();
                } else {
                    controller.get(modelSurveyData.oData.id, true);
                }
            },
            error: (error) => oApp.setBusy(false),
        });
    },

    unlock: function () {
        const toggleDisplay = () => {
            oApp.setBusy(false);
            controller.get(modelSurveyData.oData.id, false);
        };

        var processFunction = function () {
            oApp.setBusy(true);

            sap.n.Planet9.function({
                id: "Locking",
                method: "Unlock",
                hideToast: true,
                data: {
                    objectType: cockpitUtils.dataSet,
                    objectID: modelSurveyData.oData.id,
                },
                success: (data) => toggleDisplay(),
                error: (error) => {
                    toggleDisplay();
                    if (error.status !== 403) {
                        sap.m.MessageBox.error(error?.responseJSON?.status || error.status || "An error has ocurred");
                    }
                },
            });
        };

        // Check for changes
        if (cockpitUtils.dataSaved !== modelSurveyData.getJSON()) {
            sap.n.Planet9.messageChange(processFunction);
        } else {
            processFunction();
        }
    },

    back: function () {
        var processFunction = function () {
            if (modelappControl.oData.enableEdit) {
                sap.n.Planet9.function({
                    id: "Locking",
                    method: "Unlock",
                    hideToast: true,
                    data: {
                        objectType: cockpitUtils.dataSet,
                        objectID: modelSurveyData.oData.id,
                    },
                    success: function (data) {},
                    error: (error) => {
                        if (error.status !== 403) {
                            sap.m.MessageBox.error(error?.responseJSON?.status || error.status || "An error has ocurred");
                        }
                    },
                });
            }

            // Navigate Back to Adaptive List
            oApp.back();

            // Cockpit Action
            sap.n.Planet9.setToolbarButton(false);
        };

        // Check for changes
        if (cockpitUtils.dataSaved !== modelSurveyData.getJSON()) {
            sap.n.Planet9.messageChange(processFunction);
        } else {
            processFunction();
        }
    },
};

cockpitUtils.init();
