const controller = {
    currentIndex: null,

    questionTypes: [
        { icon: "sap-icon://date-time", text: "Date", type: "Date" },
        { icon: "sap-icon://text", text: "Text", type: "Text" },
        { icon: "sap-icon://number-sign", text: "Numeric", type: "Numeric" },
        { icon: "sap-icon://chart-table-view", text: "Likert", type: "Likert" },
        { icon: "sap-icon://fa-regular/circle", text: "Single Choice", type: "SingleChoice" },
        { icon: "sap-icon://multi-select", text: "Multiple Choice", type: "MultipleChoice" },
        { icon: "sap-icon://fa-solid/tachometer-alt", text: "Net Promoter Score", type: "NPS" },
    ],

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
        apiFormList();
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
                        location.href = location.origin + "/cockpit.html#survey-form";
                    }
                },
            });
        }

        modeloListQuestionTypes.setData(controller.questionTypes);
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
        apiFormGet({
            parameters: {
                id: id,
            },
        }).then(async function (data) {
            modelSurveyData.setData(data);
            cockpitUtils.dataSaved = modelSurveyData.getJSON();

            if (oApp.getCurrentPage() === oPageStart) {
                tabDetail.setSelectedItem(tabDetailInfo);
            }

            setFormBackground(modelSurveyData.oData.setup.backgroundImage);

            cockpitUtils.toggleEdit(editable);
            cockpitUtils.dataSaved = modelSurveyData.getJSON();
            oApp.to(oPageDetail);
        });
    },

    copy: function () {
        delete modelSurveyData.oData.survey.id;
        modelSurveyData.oData.survey.name = modelSurveyData.oData.name + " (COPY)";
        controller.save();
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
                                controller.doSave(true);
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
                cockpitUtils.dataSaved = modelSurveyData.getJSON();
                cockpitUtils.toggleEdit(true);

                sap.m.MessageToast.show("Form Saved");

                toolStartUpdate.firePress();
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
                        toolStartUpdate.firePress();
                        sap.m.MessageToast.show("Form Deleted");
                        oApp.backToPage(oPageStart);
                        
                        // Cockpit Action
                        sap.n.Planet9.setToolbarButton(false);
                    });
                }
            },
        });
    },

    buildValParamSelect: (select, length) => {
        return;
        select.destroyItems();
        let i = length;
        while (i > 0) {
            select.addItem(
                new sap.ui.core.ListItem({
                    key: i,
                    text: i,
                })
            );
            i--;
        }
    },
};

const debounceSave = debounce(controller.doSave, 500, true);
