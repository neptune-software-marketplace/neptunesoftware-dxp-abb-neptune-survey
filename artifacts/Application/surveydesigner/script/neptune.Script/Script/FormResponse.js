const formResponse = {
    overallId: ModelData.genID(),
    overallSeries: null,
    overallCategory: null,
    pdfContent: null,
    response: null,
    anonymous: null,
    charts: [],
    build: function (responses) {
        formResponse.anonymous = modelSurveyMaster.oData.survey.distribution.anonymous;
        formResponse.response = {};

        tabSurveyResponse.setCount(responses.length);

        responses.forEach(function (response) {
            formResponse.flatten(response);
        });

        formResponse.buildReport();
    },

    buildReport: function () {
        const parent = panResponse;

        formResponse.charts = [];
        formResponse.overallSeries = {};
        formResponse.overallCategory = [];

        parent.destroyContent();

        const surveyHeader = new nep.bootstrap.Alert();

        if (modelSurveyData.oData.setup && modelSurveyData.oData.setup.headerColor) {
            surveyHeader.setContextColor(modelSurveyData.oData.setup.headerColor);
        }

        surveyHeader.addContent(
            new nep.bootstrap.Text({
                text: modelSurveyMaster.oData.survey.distribution.enableSurveyTitle
                    ? modelSurveyMaster.oData.survey.name
                    : modelSurveyData.oData.name,
                fontSize: "FontSize2",
            })
        );

        if (modelSurveyData.oData.description) {
            surveyHeader.addContent(
                new nep.bootstrap.Text({
                    text: modelSurveyMaster.oData.survey.distribution.enableSurveySubTitle
                        ? modelSurveyMaster.oData.survey.description
                        : modelSurveyData.oData.description,
                    type: "Paragraph",
                })
            );
        }

        parent.addContent(surveyHeader);

        // Overall Result
        const doOverall = ModelData.Find(modelSurveyData.oData.questions, "includeInOverall", true);
        if (doOverall.length) formResponse.buildOverallChart(parent);

        let qNum = 1;
        modelSurveyData.oData.questions.forEach((question) => {
            const questionTop = new sap.m.Panel({
                expanded: true,
                expandable: true,
                backgroundDesign: "Solid",
            });
            questionTop.addStyleClass("formBorder sapUiMediumMarginTopBottom");

            const questionToolbar = new sap.m.Toolbar({
                width: "100%",
                height: "60px",
            }).addStyleClass("sapUiSizeCompact");

            questionTop.setHeaderToolbar(questionToolbar);

            const questionParent = new sap.m.VBox({
                renderType: sap.m.FlexRendertype.Bare,
            }).addStyleClass("formChart");

            questionToolbar.addContent(
                new nep.bootstrap.Text({
                    text: `${qNum++}. ${question.title}`,
                    textColor: "Secondary",
                    fontSize: "FontSize5",
                    fontWeight: "Bold",
                    textWrapping: true,
                })
            );

            if (question.required) {
                questionToolbar.addContent(
                    new sap.m.Label({
                        required: true,
                    })
                );
            }

            if (question.enableSubtitle) {
                questionParent.addItem(
                    new nep.bootstrap.Text({
                        text: question.subtitle,
                        textColor: "Secondary",
                        fontSize: "FontSize6",
                    })
                );
            }

            // Number of responses
            const response = formResponse.response[question.id];
            if (response) {
                questionParent.addItem(
                    new sap.tnt.InfoLabel({
                        text: response.responseCount + " Responses",
                        width: "150px",
                        colorScheme: 1,
                    }).addStyleClass("sapUiSmallMarginTopBottom")
                );
            }

            questionParent.addItem(new sap.m.VBox({ height: "20px" }));

            questionTop.addContent(questionParent);
            parent.addContent(questionTop);

            switch (question.type) {
                case "Text":
                case "Date":
                case "Numeric":
                    formResponse.buildReportText(question, questionParent);
                    break;

                case "NPS":
                    formResponse.buildReportNPS(question, questionParent);
                    formResponse.buildToolbar(question, questionParent);
                    break;

                case "Likert":
                    formResponse.buildReportLikert(question, questionParent);
                    formResponse.buildToolbar(question, questionParent);
                    break;

                case "MultipleChoice":
                case "SingleChoice":
                    formResponse.buildReportChoice(question, questionParent);
                    formResponse.buildToolbar(question, questionParent);
                    break;

                default:
                    break;
            }
        });
    },

    buildToolbar: function (question, parent) {
        const toolbar = new sap.m.Toolbar({
            width: "100%",
        }).addStyleClass("sapUiSmallMarginTop sapUiSizeCompact formToolbar");

        toolbar.addContent(new sap.m.ToolbarSpacer());

        const chartPolar = new sap.m.CheckBox({
            text: "Spiderweb",
            selected: "{/chartPolar" + question.id + "}",
            select: function (oEvent) {
                formResponse.buildReport();
            },
        });

        toolbar.addContent(chartPolar);

        const chartTypes = new sap.m.Select({
            width: "150px",
            selectedKey: "{/chartType" + question.id + "}",
            change: function (oEvent) {
                formResponse.buildReport();
            },
        });

        switch (question.type) {
            case "NPS":
                chartTypes.addItem(new sap.ui.core.Item({ key: "bar", text: "Bar" }));
                chartTypes.addItem(new sap.ui.core.Item({ key: "column", text: "Column" }));
                break;

            default:
                chartTypes.addItem(new sap.ui.core.Item({ key: "area", text: "Area" }));
                chartTypes.addItem(
                    new sap.ui.core.Item({ key: "areaspline", text: "Area Spline" })
                );
                chartTypes.addItem(new sap.ui.core.Item({ key: "spline", text: "Spline" }));
                chartTypes.addItem(new sap.ui.core.Item({ key: "bar", text: "Bar" }));
                chartTypes.addItem(new sap.ui.core.Item({ key: "line", text: "Line" }));
                chartTypes.addItem(new sap.ui.core.Item({ key: "column", text: "Column" }));
                break;
        }

        toolbar.addContent(chartTypes);
        parent.addItem(toolbar);
    },

    buildOverallChart: function (parent) {
        const questionTop = new sap.m.Panel({
            expanded: true,
            expandable: true,
            backgroundDesign: "Solid",
        });
        questionTop.addStyleClass("formBorder sapUiMediumMarginTopBottom");

        const questionToolbar = new sap.m.Toolbar({
            width: "100%",
            height: "60px",
        }).addStyleClass("sapUiSizeCompact");

        questionTop.setHeaderToolbar(questionToolbar);

        const questionParent = new sap.m.VBox({
            renderType: sap.m.FlexRendertype.Bare,
        }).addStyleClass("formChart");

        questionTop.addContent(questionParent);

        questionToolbar.addContent(
            new nep.bootstrap.Text({
                text: "Overall Result",
                textColor: "Secondary",
                fontSize: "FontSize5",
                fontWeight: "Bold",
                textWrapping: true,
            })
        );

        const question = {
            id: formResponse.overallId,
        };

        // Chart
        // Default Settings
        if (!modelpanResponse.oData["chartType" + question.id]) {
            modelpanResponse.oData["chartType" + question.id] = "bar";
        }

        const chartparent = new sap.m.Panel("questionParent" + question.id, { height: "500px" });
        questionParent.addItem(chartparent);

        chartparent.onAfterRendering = function () {
            // Chart Data
            let series = [];
            const resGroupsItems = Object.keys(formResponse.overallSeries);

            resGroupsItems.forEach(function (keyGroup) {
                const groupValues = formResponse.overallSeries[keyGroup];

                let seriesData = {
                    name: keyGroup,
                    data: groupValues,
                    borderWidth: 0,
                };

                if (modelpanResponse.oData["chartPolar" + question.id]) {
                    seriesData.pointPlacement = "on";
                }

                const group = ModelData.FindFirst(modelMasterData.oData.groups, "name", keyGroup);
                if (group && group.setup && group.setup.color) seriesData.color = group.setup.color;

                series.push(seriesData);
            });

            let options = formResponse.setChartDefaults(
                formResponse.overallCategory,
                series,
                question
            );

            Highcharts.chart(chartparent.getDomRef(), options);
            formResponse.charts.push(chartparent.sId);
        };

        // Toolbar
        formResponse.buildToolbar(question, questionParent);

        parent.addContent(questionTop);
    },

    buildReportNPS: function (question, parent) {
        const response = formResponse.response[question.id];
        if (!response) return;

        // Default Settings
        if (!modelpanResponse.oData["chartType" + question.id]) {
            modelpanResponse.oData["chartType" + question.id] = "bar";
        }

        const chartparent = new sap.m.Panel("questionParent" + question.id, { height: "500px" });
        parent.addItem(chartparent);

        // Chart Data
        let series = [];
        const categories = [question.title];

        const resGroupsItems = Object.keys(response.group);

        resGroupsItems.forEach(function (keyGroup) {
            const groupData = response.group[keyGroup];
            const group = ModelData.FindFirst(modelMasterData.oData.groups, "id", keyGroup);

            let itemValues = [];
            let totValue = 0;

            groupData.total.forEach(function (value) {
                totValue += value;
            });

            itemValues.push(parseFloat((totValue / groupData.responseCount).toFixed(2)));

            let seriesData = {
                name: group.name || "No Group",
                data: itemValues,
                borderWidth: 0,
            };

            if (modelpanResponse.oData["chartPolar" + question.id]) {
                seriesData.pointPlacement = "on";
            }

            if (group && group.setup && group.setup.color) seriesData.color = group.setup.color;

            series.push(seriesData);
        });

        chartparent.onAfterRendering = function () {
            let options = formResponse.setChartDefaults(categories, series, question);
            Highcharts.chart(chartparent.getDomRef(), options);
            formResponse.charts.push(chartparent.sId);
        };
    },

    buildReportChoice: function (question, parent) {
        const response = formResponse.response[question.id];
        if (!response) return;

        // Overall
        if (question.includeInOverall) formResponse.overallCategory.push(question.title);

        // Default Settings
        if (!modelpanResponse.oData["chartType" + question.id]) {
            modelpanResponse.oData["chartType" + question.id] = "bar";
        }

        const chartparent = new sap.m.Panel("questionParent" + question.id, { height: "500px" });
        parent.addItem(chartparent);

        // Chart Data
        let categories = [];
        let series = [];

        const resGroupsItems = Object.keys(response.group);

        resGroupsItems.forEach(function (keyGroup) {
            const groupData = response.group[keyGroup];
            const group = ModelData.FindFirst(modelMasterData.oData.groups, "id", keyGroup);

            let data = [];

            let seriesData = {
                name: group.name || "No Group",
                borderWidth: 0,
            };

            question.items.forEach(function (item) {
                data.push(groupData.count[item.id]);
            });

            seriesData.data = data;

            if (modelpanResponse.oData["chartPolar" + question.id]) {
                seriesData.pointPlacement = "on";
            }

            if (group && group.setup && group.setup.color) seriesData.color = group.setup.color;

            series.push(seriesData);

            // Overall
            if (question.includeInOverall) formResponse.calculateOverall(seriesData);
        });

        question.items.forEach(function (item) {
            categories.push(item.title);
        });

        chartparent.onAfterRendering = function () {
            let options = formResponse.setChartDefaults(categories, series, question);
            Highcharts.chart(chartparent.getDomRef(), options);
            formResponse.charts.push(chartparent.sId);
        };
    },

    buildReportLikert: function (question, parent) {
        const response = formResponse.response[question.id];
        if (!response) return;

        // Overall
        if (question.includeInOverall) formResponse.overallCategory.push(question.title);

        // Default Settings
        if (!modelpanResponse.oData["chartType" + question.id]) {
            modelpanResponse.oData["chartType" + question.id] = "bar";
        }

        const chartparent = new sap.m.Panel("questionParent" + question.id, {
            height: "500px",
        }).addStyleClass("formChart");

        parent.addItem(chartparent);

        // Chart Data
        let series = [];
        let categories = [];

        const resGroupsItems = Object.keys(response.group);

        resGroupsItems.forEach(function (keyGroup) {
            const groupData = response.group[keyGroup];
            const resItems = Object.keys(groupData.items);
            const group = ModelData.FindFirst(modelMasterData.oData.groups, "id", keyGroup);

            let itemValues = [];

            resItems.forEach(function (keyItem) {
                const itemData = groupData.items[keyItem];
                let totValue = 0;
                itemData.total.forEach(function (value) {
                    totValue += value;
                });
                itemValues.push(parseFloat((totValue / itemData.responseCount).toFixed(2)));
                categories.push(itemData.title);
            });

            let seriesData = {
                name: group.name || "No Group",
                data: itemValues,
                borderWidth: 0,
            };

            if (modelpanResponse.oData["chartPolar" + question.id]) {
                seriesData.pointPlacement = "on";
            }

            if (group && group.setup && group.setup.color) seriesData.color = group.setup.color;

            series.push(seriesData);

            // Overall
            if (question.includeInOverall) formResponse.calculateOverall(seriesData);
        });

        chartparent.onAfterRendering = function () {
            let options = formResponse.setChartDefaults(categories, series, question);
            Highcharts.chart(chartparent.getDomRef(), options);
            formResponse.charts.push(chartparent.sId);
        };
    },

    calculateOverall: function (seriesData) {
        let overallValue = 0;
        let overallCounter = 0;

        seriesData.data.forEach(function (value) {
            overallValue += value;
            overallCounter++;
        });

        if (!formResponse.overallSeries[seriesData.name]) {
            formResponse.overallSeries[seriesData.name] = [];
        }

        formResponse.overallSeries[seriesData.name].push(
            parseFloat((overallValue / overallCounter).toFixed(2))
        );
    },

    setChartDefaults: function (categories, series, question) {
        let options = {
            credits: false,
            chart: {
                style: { fontFamily: "72", fontSize: "12px" },
                backgroundColor: "white",
                type: modelpanResponse.oData["chartType" + question.id],
                polar: modelpanResponse.oData["chartPolar" + question.id],
            },
            title: { text: null },
            yAxis: { title: { text: null } },
            xAxis: {
                title: { text: null },
                categories,
            },
            legend: {
                backgroundColor: "transparent",
                itemStyle: { fontSize: "12px", fontWeight: "Normal" },
                align: "center",
                verticalAlign: "bottom",
            },
            series,
        };

        if (modelpanResponse.oData["chartPolar" + question.id]) {
            options.yAxis.gridLineInterpolation = "polygon";
            options.yAxis.lineWidth = 0;
            options.yAxis.min = 0;
            options.xAxis.lineWidth = 0;
            options.xAxis.tickmarkPlacement = "on";
        }

        return options;
    },

    buildReportText: function (question, parent) {
        const response = formResponse.response[question.id];
        if (!response) return;

        const tableText = new sap.m.Table("questionParent" + question.id, {
            alternateRowColors: true,
            growing: true,
            growingThreshold: 10,
        });

        const columnText = new sap.m.ColumnListItem();

        tableText.addColumn(new sap.m.Column());
        tableText.addColumn(new sap.m.Column());

        if (!formResponse.anonymous) {
            tableText.addColumn(new sap.m.Column());

            columnText.addCell(
                new nep.bootstrap.Text({
                    text: "{email}",
                    fontSize: "FontSize6",
                    textColor: "Muted",
                })
            );
        }

        columnText.addCell(
            new nep.bootstrap.Text({
                text: "{group}",
                fontSize: "FontSize6",
                textColor: "Muted",
            })
        );

        columnText.addCell(
            new nep.bootstrap.Text({
                text: "{text}",
                fontSize: "FontSize6",
                textColor: "Muted",
            })
        );

        var modelTableText = new sap.ui.model.json.JSONModel();
        tableText.setModel(modelTableText);

        tableText.bindAggregation("items", {
            path: "/",
            template: columnText,
            templateShareable: false,
        });

        let answers = [];

        const resGroupsItems = Object.keys(response.group);

        resGroupsItems.forEach(function (keyGroup) {
            const groupData = response.group[keyGroup];
            const group = ModelData.FindFirst(modelMasterData.oData.groups, "id", keyGroup);

            groupData.answer.forEach(function (answer, index) {
                let newRec = {
                    text: answer,
                    group: group.name,
                };

                if (!formResponse.anonymous) {
                    newRec.email = groupData.items[index];
                }

                answers.push(newRec);
            });
        });

        modelTableText.setData(answers);
        modelTableText.refresh();

        parent.addItem(tableText);
    },

    flatten: function (response) {
        const resQuestions = Object.keys(response.response);

        resQuestions.forEach(function (keyQuestion) {
            let count = [];
            let total = [];
            const resData = response.response[keyQuestion];
            if (!resData) return;

            const question = ModelData.FindFirst(
                modelSurveyData.oData.questions,
                "id",
                keyQuestion
            );

            if (!formResponse.response[question.id]) {
                formResponse.response[question.id] = {
                    id: question.id,
                    title: question.title,
                    type: question.type,
                    group: {},
                    responseCount: 0,
                };
            }

            if (!formResponse.response[question.id].group[response.groupid]) {
                if (
                    question.items &&
                    (question.type === "SingleChoice" || question.type === "MultipleChoice")
                ) {
                    count = {};
                    total = {};
                    question.items.forEach(function (item) {
                        count[item.id] = 0;
                        total[item.id] = 0;
                    });
                }

                if (question.type === "NPS") {
                    count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    total = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                }

                formResponse.response[question.id].group[response.groupid] = {
                    items: [],
                    answer: [],
                    count: count,
                    total: total,
                    responseCount: 0,
                };
            }

            formResponse.response[question.id].responseCount++;

            switch (question.type) {
                case "Likert":
                    var resItems = Object.keys(resData);

                    resItems.forEach(function (keyItem) {
                        const resItem = resData[keyItem];
                        const item = ModelData.FindFirst(question.items, "id", keyItem);

                        if (
                            !formResponse.response[question.id].group[response.groupid].items[
                                item.id
                            ]
                        ) {
                            formResponse.response[question.id].group[response.groupid].items[
                                item.id
                            ] = {
                                id: item.id,
                                title: item.title,
                                responseCount: 0,
                                count: [0, 0, 0, 0, 0],
                                total: [0, 0, 0, 0, 0],
                            };
                        }

                        formResponse
                            .response[question.id].group[response.groupid].items[item.id].responseCount++;
                        formResponse
                            .response[question.id].group[response.groupid].items[item.id].count[resItem - 1]++;
                        formResponse.response[question.id].group[response.groupid].items[
                            item.id
                        ].total[resItem - 1] += resItem;
                    });
                    break;

                case "MultipleChoice":
                    var resItems = Object.keys(resData);

                    formResponse.response[question.id].group[response.groupid].responseCount++;

                    resItems.forEach(function (keyItem) {
                        const resItem = resData[keyItem];
                        formResponse.response[question.id].group[response.groupid].count[keyItem]++;
                        formResponse.response[question.id].group[response.groupid].total[
                            keyItem
                        ] += parseInt(resItem);
                    });
                    break;

                case "SingleChoice":
                    formResponse.response[question.id].group[response.groupid].responseCount++;
                    formResponse.response[question.id].group[response.groupid].count[resData]++;

                    const item = ModelData.FindFirst(question.items, "id", resData);
                    formResponse.response[question.id].group[response.groupid].total[resData] +=
                        item.value;
                    break;

                case "NPS":
                    formResponse.response[question.id].group[response.groupid].responseCount++;
                    formResponse.response[question.id].group[response.groupid].count[resData]++;
                    formResponse.response[question.id].group[response.groupid].total[
                        resData
                    ] += parseInt(resData);
                    break;

                default:
                    if (resData) {
                        formResponse.response[question.id].group[response.groupid].responseCount++;
                        formResponse.response[question.id].group[response.groupid].answer.push(
                            resData
                        );
                        formResponse.response[question.id].group[response.groupid].items.push(
                            response.email
                        );
                    }
                    break;
            }
        });
    },

    generatePDF: function () {
        let pdfData = {
            survey: {
                title: modelSurveyMaster.oData.survey.distribution.enableSurveyTitle
                    ? modelSurveyMaster.oData.survey.name
                    : modelSurveyData.oData.name,
                subTitle: modelSurveyMaster.oData.survey.distribution.enableSurveySubTitle
                    ? modelSurveyMaster.oData.survey.description
                    : modelSurveyData.oData.description,
            },
            questions: [],
        };

        let qNum = 1;
        let actions = [];

        // Overall Result
        const doOverall = ModelData.Find(modelSurveyData.oData.questions, "includeInOverall", true);
        if (doOverall.length) {
            let questionData = {
                id: formResponse.overallId,
                type: "Overall",
                title: "Overall Result",
                imageData: "/public/images/nsball.png",
                imageWidth: 550,
                enableImage: true,
                enableTable: false,
                responsesCount: tabSurveyResponse.getCount(),
                responses: [],
            };

            actions.push(formResponse.generateImage(questionData));
            pdfData.questions.push(questionData);
        }

        modelSurveyData.oData.questions.forEach((question) => {
            let responseCount = formResponse.response[question.id]
                ? formResponse.response[question.id].responseCount
                : 0;

            let questionData = {
                id: question.id,
                type: question.type,
                title: qNum + ". " + question.title,
                subTitle: question.subTitle,
                imageData: "/public/images/nsball.png",
                imageWidth: 550,
                enableImage: false,
                enableTable: false,
                responsesCount: responseCount,
                responses: [],
            };

            switch (question.type) {
                case "NPS":
                case "Likert":
                case "SingleChoice":
                case "MultipleChoice":
                    questionData.enableImage = true;
                    actions.push(formResponse.generateImage(question));
                    break;

                default:
                    const questionParent = sap.ui.getCore().byId("questionParent" + question.id);

                    if (questionParent) {
                        questionData.responses = questionParent.getModel().getData();

                        // Remove illegal characters
                        questionData.responses.forEach((response) => {
                            response.text = response.text.replace(/\n/g, " ");
                        });
                    }

                    questionData.imageWidth = 0;
                    questionData.enableTable = true;
                    break;
            }

            pdfData.questions.push(questionData);
            qNum++;
        });

        Promise.all(actions).then(function (values) {
            values.forEach((value) => {
                var questionData = ModelData.FindFirst(pdfData.questions, "id", value.id);
                questionData.imageData = value.imageData;
            });

            apiReportGenerate({
                data: pdfData,
            }).then(function (res) {
                oBusy.close();
                formResponse.pdfContent = res;
                diaPDF.open();
            });
        });
    },

    generateImage: function (question) {
        return new Promise(function (resolve) {
            const node = document.getElementById("questionParent" + question.id).childNodes[0];

            domtoimage
                .toJpeg(node, {
                    cacheBust: true,
                })
                .then(function (dataUrl) {
                    resolve({ id: question.id, imageData: dataUrl });
                })
                .catch(function (error) {
                    resolve({});
                });
        });
    },
};
