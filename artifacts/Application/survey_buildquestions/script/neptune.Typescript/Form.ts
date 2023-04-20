function buildForm(
    parent: sap.m.Panel,
    data: SurveyData,
    link: string,
    modelResponseData: sap.ui.model.json.JSONModel,
    surveyid: string,
    submitCallBack: Function
) {
    setFormBackground(data.setup.backgroundImage);

    parent.destroyContent();

    modelResponseData.setData({
        surveyid: surveyid,
        link,
        response: {},
    });

    const surveyHeader = new nep.bootstrap.Alert();

    if (data.setup && data.setup.headerColor) {
        surveyHeader.setContextColor(data.setup.headerColor);
    }

    surveyHeader.addContent(
        new nep.bootstrap.Text({
            text: data.name,
            fontSize: "FontSize2",
        })
    );

    if (data.description) {
        surveyHeader.addContent(
            new nep.bootstrap.Text({
                text: data.description,
                type: "Paragraph",
            })
        );
    }

    parent.addContent(surveyHeader);

    let qNum = 1;
    data.questions.forEach((question) => {
        const questionTop = new sap.m.Panel("questionTop" + question.id);
        questionTop.addStyleClass("formBorder sapUiMediumMarginTopBottom");

        const questionParent = new sap.m.VBox(undefined, {
            renderType: sap.m.FlexRendertype.Bare,
        });
        const questionTitle = new sap.m.HBox();

        questionTitle.addItem(
            new nep.bootstrap.Text({
                text: `${qNum++}. ${question.title}`,
                fontSize: "FontSize5",
                fontWeight: "Bold",
            })
        );

        if (question.required) {
            questionTitle.addItem(
                new sap.m.Label(undefined, {
                    required: true,
                })
            );
        }
        questionParent.addItem(questionTitle);

        if (question.enableSubtitle) {
            questionParent.addItem(
                new nep.bootstrap.Text({
                    text: question.subtitle,
                    fontSize: "FontSize6",
                })
            );
        }

        questionParent.addItem(new sap.m.VBox(undefined, { height: "20px" }));

        QuestionBuilder[question.type]?.(questionParent, question, modelResponseData);

        questionTop.addContent(questionParent);
        parent.addContent(questionTop);

        modelResponseData.refresh();
    });

    if (link !== "preview") {
        parent.addContent(
            new sap.m.Button(undefined, {
                text: "Submit",
                width: "150px",
                type: sap.m.ButtonType.Ghost,
                press: async function (oEvent) {
                    const isValidResponses = validateResponses(data.questions, modelResponseData);

                    if (isValidResponses) {
                        fetch(`/public/serverscript/surveypublic/submit`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(modelResponseData.getData()),
                        }).then(async function (result) {
                            if (result.status === 200 && submitCallBack) {
                                submitCallBack();
                            }
                        });
                    }
                },
            })
        );
    }

    parent.addContent(
        new sap.m.VBox(undefined, {
            height: "50px",
        })
    );
}

function validateResponses(
    questions: QuestionDefinition[],
    modelResponseData: sap.ui.model.json.JSONModel
) {
    const requiredQuestions = questions.filter((question) => question.required);
    const notReqMultipleChoiceQuestions = questions.filter(
        (question) => question.type === "MultipleChoice" && !question.required
    );

    let allQuestionsAnswered = true;
    let reqValidationPassed = true;
    let multiChoiceValidationPassed = true;

    requiredQuestions.forEach((question) => {
        const questionPanel = sap.ui.getCore().byId("questionTop" + question.id);
        let invalidResponse = false;

        //@ts-ignore
        questionPanel.removeStyleClass("invalidResponse");
        const extendedValReq =
            ["Likert", "MultipleChoice"].includes(question.type) && !!question.items;

        if (!extendedValReq && !modelResponseData.getData().response[question.id]) {
            invalidResponse = true;
        }

        if (extendedValReq && question.type === "Likert") {
            question.items.forEach((item, index) => {
                const likertQuestionItem = sap.ui.getCore().byId("questionItem" + item.id);
                //@ts-ignore
                likertQuestionItem.setHighlight("None");

                if (
                    !modelResponseData.getData().response[question.id] ||
                    !modelResponseData.getData().response[question.id][item.id]
                ) {
                    //@ts-ignore
                    likertQuestionItem.setHighlight("Error");
                    invalidResponse = true;
                }
            });
        }

        if (extendedValReq && question.type === "MultipleChoice") {
            const { validationType, validationParam } = question;
            const response = modelResponseData.getData().response;
            const relevantResponse = response[question.id];

            const { valid } = validateMultipleChoice(
                validationType,
                validationParam,
                relevantResponse
            );

            invalidResponse = !valid;
        }

        if (invalidResponse) {
            //@ts-ignore
            questionPanel.addStyleClass("invalidResponse");
            allQuestionsAnswered = false;
            reqValidationPassed = false;
        }
    });

    notReqMultipleChoiceQuestions.forEach((question) => {
        const questionPanel = sap.ui.getCore().byId("questionTop" + question.id);
        //@ts-ignore
        questionPanel.removeStyleClass("invalidResponse");
        const { validationType, validationParam } = question;
        const response = modelResponseData.getData().response;
        const relevantResponse = response[question.id];

        const { valid } = validateMultipleChoice(validationType, validationParam, relevantResponse);

        if (!valid) {
            //@ts-ignore
            questionPanel.addStyleClass("invalidResponse");
            allQuestionsAnswered = false;
            multiChoiceValidationPassed = false;
        }
    });

    if (!allQuestionsAnswered) {
        const reqValidationText = !reqValidationPassed
            ? "Please provide answers to all questions marked as required before submitting."
            : "";
        const multiChoiceValidationText = !multiChoiceValidationPassed
            ? "Some multiple choice questions are incomplete."
            : "";
        const compositeValText = [multiChoiceValidationText, reqValidationText]
            .filter((text) => !!text)
            .join("\n");

        //@ts-ignore
        sap.m.MessageBox.show(compositeValText, {
            icon: sap.m.MessageBox.Icon.ERROR,
            title: "One or more required questions are missing answers.",
            actions: sap.m.MessageBox.Action.CLOSE,
        });
    }

    return allQuestionsAnswered;
}
