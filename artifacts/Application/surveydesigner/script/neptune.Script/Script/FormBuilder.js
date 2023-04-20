const formBuilder = {
    currentIndex: null,
    dataSaved: null,

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

    questionTypes: [
        { icon: "sap-icon://date-time", text: "Date", type: "Date" },
        { icon: "sap-icon://text", text: "Text", type: "Text" },
        { icon: "sap-icon://number-sign", text: "Numeric", type: "Numeric" },
        { icon: "sap-icon://chart-table-view", text: "Likert", type: "Likert" },
        { icon: "sap-icon://fa-regular/circle", text: "Single Choice", type: "SingleChoice" },
        { icon: "sap-icon://multi-select", text: "Multiple Choice", type: "MultipleChoice" },
        // { icon: "sap-icon://feedback", text: "Rating", type: "Rating" },
        { icon: "sap-icon://fa-solid/tachometer-alt", text: "Net Promoter Score", type: "NPS" },
    ],

    init: function () {
        modeloListQuestionTypes.setData(formBuilder.questionTypes);
    },

    openQuestionMenu: function (parent, index) {
        formBuilder.currentIndex = index;
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

        if (formBuilder.currentIndex) {
            modelSurveyData.oData.questions.splice(formBuilder.currentIndex, 0, newQuestion);
        } else {
            modelSurveyData.oData.questions.push(newQuestion);
        }

        modelSurveyData.refresh();
    },

    getDetail: function (id) {
        apiFormGet({
            parameters: {
                id: id,
            },
        }).then(async function (data) {
            modelSurveyData.setData(data);
            formBuilder.dataSaved = modelSurveyData.getJSON();

            tabForm.setSelectedItem(tabFormQuestions);
            setFormBackground(modelSurveyData.getData().setup.backgroundImage);

            oApp.to(pageFormDetail);
        });
    },

    copy: function () {
        delete modelSurveyData.oData.survey.id;
        modelSurveyData.oData.survey.name = modelSurveyData.oData.name + " (COPY)";
        formBuilder.save();
    },

    save: function () {
        debounceSave();
    },

    doSave: function (ignoreWarning = false) {
        modelSurveyData.oData.questions.forEach((question) => {
            if ((question.type === "Likert" || question.type === "SingleChoice" || question.type === "MultipleChoice") && question.items.length === 0) {
                sap.m.MessageBox.show("One or more of your questions are missing options and can not be answered by the receiver.", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    actions: sap.m.MessageBox.Action.OK,
                    title: "Warning",
                });
            }
        });

        apiFormSave({
            data: { ...modelSurveyData.oData, ...(ignoreWarning && { ignoreWarning }) },
        })
            .then(function (data) {
                if (data.status === "Warning") {
                    sap.m.MessageBox.warning(data.message, {
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        initialFocus: "No",
                        onClose: function (sAction) {
                            if (sAction === "YES") {
                                formBuilder.doSave(true);
                            }
                        },
                    });
                    return;
                }

                if (data.status === "ERROR") {
                    sap.m.MessageBox.error(data.status);
                    return;
                }

                modelSurveyData.setData(data);
                formBuilder.dataSaved = modelSurveyData.getJSON();

                toastStatus.setMessage("Form Saved");
                toastStatus.clone().show();

                toolFormUpdate.firePress();
            })
            .catch(function (error) {
                console.log(error);
            });
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
                        toolFormUpdate.firePress();

                        toastStatus.setMessage("Form Deleted");
                        toastStatus.clone().show();

                        oApp.backToPage(pageFormList);
                    });
                }
            },
        });
    },

    getSurvey: function (id) {
        apiSurveyGet({
            parameters: {
                id: id,
            },
        }).then(function (res) {
            modelSurveyMaster.setData(res);
            formBuilder.dataSaved = modelSurveyMaster.getJSON();

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

            oApp.to(pageSurveyDetail);
        });
    },

    addUsers: function (users) {
        apiUsersSave({
            data: users,
            parameters: {
                id: modelSurveyMaster.oData.survey.id,
            },
        }).then(function (res) {
            tabSystemUsers.removeSelections();
            modelSurveyMaster.oData.users = res.users;
            modelSurveyMaster.refresh();
            formBuilder.dataSaved = modelSurveyMaster.getJSON();
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
            formBuilder.dataSaved = modelSurveyMaster.getJSON();
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
            formBuilder.dataSaved = modelSurveyMaster.getJSON();
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
            formBuilder.dataSaved = modelSurveyMaster.getJSON();
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
            formBuilder.dataSaved = modelSurveyMaster.getJSON();
        });
    },

    sendEmails: function (emails) {
        const emailList = emails.map((receiver) => {
            return {
                id: receiver.id,
                // link: `${location.host}/public/app/surveysubmit?surveyid=${receiver.surveyid}&link=${receiver.id}`,
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
                toolReceiversUpdate.firePress();
                sap.m.MessageToast.show("Invites sent successfully!");
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

const debounceSave = debounce(formBuilder.doSave, 500, true);
