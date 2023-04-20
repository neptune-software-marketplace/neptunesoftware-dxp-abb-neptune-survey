const controller = {
    currentIndex: null,

    buildForm: function () {
        let formData = ModelData.FindFirst(modelMasterData.oData.form, "id", modelSurveyMaster.oData.survey.formid);

        formData = JSON.parse(JSON.stringify(formData));

        if (modelSurveyMaster.oData.survey.distribution.enableSurveyTitle) {
            formData.name = modelSurveyMaster.oData.survey.name;
        }

        if (modelSurveyMaster.oData.survey.distribution.enableSurveySubTitle) {
            formData.description = modelSurveyMaster.oData.survey.description;
        }

        buildForm(panPreviewSurvey, formData, "preview", modelResponseData, null);
    },

    list: function () {
        apiMaster();
    },

    init: function () {
        jQuery.sap.require("sap.m.MessageBox");

        if (!cockpitUtils.isCockpit) {
            sap.m.MessageBox.confirm("Neptune SURVEY is only supported to run inside our Cockpit. Press OK and we will guide to to the right place.", {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "System Information",
                actions: [sap.m.MessageBox.Action.OK],
                initialFocus: "Ok",
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        location.href = location.origin + "/cockpit.html#survey-survey";
                    }
                },
            });
        }

        const theme = sap.ui.getCore().getConfiguration().getTheme();

        if (typeof Highcharts !== "undefined" && theme === "sap_horizon_dark") {
            Highcharts.setOptions(getHighchartsDarkTheme());
        }
    },

    openQuestionMenu: function (parent, index) {
        controller.currentIndex = index;
        oPopoverQuestionMenu.openBy(parent, false);
    },

    addQuestion: function (questionData) {
        const qCount = modelSurveyData.getData().questions.length + 1;

        let newQuestion = {
            id: ModelData.genID(),
            type: questionData.type,
            typeText: questionData.text,
            title: "Your Question",
            subtitle: "",
            enableSubtitle: false,
            required: false,
            _expanded: true,
        };

        switch (questionData.type) {
            case "Text":
                newQuestion.answer = "";
                newQuestion.enableLongAnswer = false;
                break;

            case "Numeric":
                newQuestion.answer = null;
                break;

            case "Date":
                newQuestion.answer = "";
                break;

            case "Rating":
                newQuestion.answer = "";
                newQuestion.levels = 5;
                newQuestion.levelsInt = 5;
                break;

            case "SingleChoice":
                newQuestion.includeInOverall = false;
                newQuestion.items = [
                    { id: ModelData.genID(), title: "Option 1", value: 1 },
                    { id: ModelData.genID(), title: "Option 2", value: 2 },
                    { id: ModelData.genID(), title: "Option 3", value: 3 },
                ];
                break;

            case "MultipleChoice":
                newQuestion.includeInOverall = false;
                newQuestion.items = [
                    { id: ModelData.genID(), title: "Option 1", value: 1 },
                    { id: ModelData.genID(), title: "Option 2", value: 2 },
                    { id: ModelData.genID(), title: "Option 3", value: 3 },
                ];
                newQuestion.validationType = "noLimit";
                newQuestion.validationParam = 1;
                break;

            case "NPS":
                newQuestion.title = "How likely are you to recommend us to a friend or colleague?";
                newQuestion.textLow = "Not at all likely";
                newQuestion.textHigh = "Extremely likely";
                newQuestion.answer = 5;
                break;

            case "Likert":
                newQuestion.includeInOverall = false;
                newQuestion.colTitle0 = "Statement";
                newQuestion.colTitle1 = "Strongly Disagree";
                newQuestion.colTitle2 = "Disagree";
                newQuestion.colTitle3 = "Neutral";
                newQuestion.colTitle4 = "Agree";
                newQuestion.colTitle5 = "Strongly Agree";

                newQuestion.items = [
                    { id: ModelData.genID(), title: "Statement 1" },
                    { id: ModelData.genID(), title: "Statement 2" },
                    { id: ModelData.genID(), title: "Statement 3" },
                ];

                break;

            default:
                break;
        }

        if (controller.currentIndex) {
            modelSurveyData.oData.questions.splice(controller.currentIndex, 0, newQuestion);
        } else {
            modelSurveyData.oData.questions.push(newQuestion);
        }

        modelSurveyData.refresh();
    },

    get: function (id, editable) {
        apiSurveyGet({
            parameters: {
                id: id,
            },
        }).then(function (res) {
            modelSurveyMaster.setData(res);

            const form = ModelData.FindFirst(modelMasterData.oData.form, "id", modelSurveyMaster.oData.survey.formid);

            modelSurveyData.setData(form);
            formResponse.build(res.responses);

            const oSorter1 = new sap.ui.model.Sorter("groupid", false, function (oContext) {
                const item = oContext.getObject();
                var group = ModelData.FindFirst(modelMasterData.oData.groups, "id", item.groupid);

                if (group) {
                    return { key: group.name, text: group.name };
                } else {
                    return { key: "No Group", text: "No Group" };
                }
            });
            const oSorter2 = new sap.ui.model.Sorter("email", false, false);
            tabReceivers.getBinding("rows").sort([oSorter1, oSorter2]);

            cockpitUtils.toggleEdit(editable);
            cockpitUtils.dataSaved = modelSurveyMaster.getJSON();

            tabSurveyUsers.setCount(res.users.length);
            tabSurveyReceivers.setCount(res.receivers.length);

            oApp.to(oPageDetail);
        });
    },

    copy: function () {
        debugger;
        delete modelSurveyMaster.oData.survey.id;
        modelSurveyMaster.oData.survey.name = modelSurveyMaster.oData.survey.name + " (COPY)";
        controller.save();
    },

    delete: function () {
        sap.m.MessageBox.confirm("Delete form from database? This cannot be undone!", {
            icon: sap.m.MessageBox.Icon.ERROR,
            title: "Danger Zone",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            initialFocus: "No",
            onClose: function (sAction) {
                if (sAction === "YES") {
                    apiFormDelete({
                        parameters: {
                            id: modelSurveyData.oData.id,
                        },
                    }).then(function (data) {
                        toolStartUpdate.firePress();
                        sap.m.MessageToast.show("Form Deleted");
                        oApp.backToPage(oPageStart);
                    });
                }
            },
        });
    },

    save: function () {
        apiSurveySave({
            data: modelSurveyMaster.oData.survey,
        }).then(function (res) {
            modelSurveyMaster.setData(res);
            modelSurveyMaster.refresh();

            sap.m.MessageToast.show("Survey Saved");

            cockpitUtils.dataSaved = modelSurveyMaster.getJSON();
            apiMaster();
        });
    },

    addUsers: function (users) {
        apiUsersSave({
            data: users,
            parameters: {
                id: modelSurveyMaster.oData.survey.id,
            },
        }).then(function (res) {
            modelSurveyMaster.oData.users = res.users;
            modelSurveyMaster.refresh();
            cockpitUtils.dataSaved = modelSurveyMaster.getJSON();
        });
    },

    deleteUsers: function (id) {
        apiUsersDelete({
            parameters: {
                id: id,
            },
        }).then(function (res) {
            tabUsers.clearSelection();
            ModelData.Delete(modelSurveyMaster.oData.users, "id", id);
            modelSurveyMaster.refresh();
            cockpitUtils.dataSaved = modelSurveyMaster.getJSON();
        });
    },

    addReceivers: function (data, groupid) {
        const emails = data.split(";");

        apiReceiversSave({
            data: emails,
            parameters: {
                id: modelSurveyMaster.oData.survey.id,
                groupid: groupid,
            },
        }).then(function (res) {
            tabReceivers.clearSelection();
            modelSurveyMaster.oData.receivers = res.receivers;
            modelSurveyMaster.refresh();
            cockpitUtils.dataSaved = modelSurveyMaster.getJSON();
        });
    },

    deleteReceivers: function (id) {
        apiReceiversDelete({
            parameters: {
                id: id,
            },
        }).then(function (res) {
            tabReceivers.clearSelection();
            ModelData.Delete(modelSurveyMaster.oData.receivers, "id", id);
            modelSurveyMaster.refresh();
            cockpitUtils.dataSaved = modelSurveyMaster.getJSON();
        });
    },

    resetReceivers: function (id) {
        apiReceiversReset({
            parameters: {
                id: id,
            },
        }).then(function (res) {
            tabReceivers.clearSelection();
            ModelData.UpdateField(modelSurveyMaster.oData.receivers, "id", id, "status", true);
            modelSurveyMaster.refresh();
            cockpitUtils.dataSaved = modelSurveyMaster.getJSON();
        });
    },

    sendEmails: function (emails) {
        const emailList = emails.map((receiver) => {
            return {
                id: receiver.id,
            };
        });

        const selectedEmailTemplate = modelSurveyMaster.oData.survey.distribution.emailTemplate;

        if (selectedEmailTemplate !== "") {
            apiReceiversSend({
                data: {
                    hostname: location.origin,
                    surveyid: modelSurveyMaster.oData.survey.id,
                    receivers: emailList,
                },
            }).then(function (data) {
                sap.m.MessageToast.show("Invites sent successfully!");
                butDetailUpdate.firePress();
            });
        } else {
            inpageSurveyDistribTemplate.setValueState("Error");

            sap.m.MessageBox.show("Please select an email template to send invites, or create an email template if none exist.", {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Email template not selected",
                actions: sap.m.MessageBox.Action.CLOSE,
            });
        }
    },
    filterStatus: function () {
        const selectedItems = toolReceiverFilter.getSelectedItems();
        const filterItems = [];

        if (selectedItems) {
            selectedItems.forEach((item) => {
                const context = item.getBindingContext("MasterData");
                const data = context.getObject();
                filterItems.push(data);
            });
        }

        let filters = [];

        const statusFilter = [];
        filterItems.forEach((item) => {
            statusFilter.push(new sap.ui.model.Filter("status", "EQ", item.status));
        });

        if (statusFilter.length) {
            filters.push(new sap.ui.model.Filter(statusFilter, false));
        }

        if (toolReceiverFilterEmail.getValue()) {
            filters.push(new sap.ui.model.Filter("email", "Contains", toolReceiverFilterEmail.getValue()));
        }

        const binding = tabReceivers.getBinding("rows");

        binding.filter(filters);
    },
};

const debounceSave = debounce(controller.doSave, 500, true);
