type ContentController = sap.ui.core.Control & {
    addContent?: (oContent: sap.ui.core.Control) => void;
};
type ItemController = sap.ui.core.Control & { addItem?: (oContent: sap.ui.core.Control) => void };

namespace QuestionBuilder {
    export function Numeric(parent: ItemController, definition: QuestionDefinition) {
        parent.addItem(
            new nep.bootstrap.Input({
                type: "Number",
                margin: "MarginBottom3",
                formLayout: "Floating",
                label: "Enter your answer",
                value: "{ResponseData>/response/" + definition.id + "}",
                backgroundColor: getTheme() === "sap_horizon" ? "Light" : "",
            })
        );
    }

    export function Text(parent: ItemController, definition: QuestionDefinition) {
        const options = {
            formLayout: "Floating",
            margin: "MarginBottom3",
            label: "Enter your answer",
            value: "{ResponseData>/response/" + definition.id + "}",
            backgroundColor: getTheme() === "sap_horizon" ? "Light" : "",
            ...(definition.enableLongAnswer && {
                type: "TextArea",
                height: "120px",
            }),
        };
        parent.addItem(new nep.bootstrap.Input(options));
    }

    export function Date(parent: ItemController, definition: QuestionDefinition) {
        parent.addItem(
            new nep.bootstrap.Input({
                type: "Date",
                margin: "MarginBottom3",
                formLayout: "Floating",
                label: "Enter your answer",
                value: "{ResponseData>/response/" + definition.id + "}",
                backgroundColor: getTheme() === "sap_horizon" ? "Light" : "",
            })
        );
    }

    export function NPS(parent: ItemController, definition: QuestionDefinition) {
        const segBut = new sap.m.SegmentedButton(undefined, {
            width: "100%",
            selectedKey: "{ResponseData>/response/" + definition.id + "}",
        });

        for (let i = 0; i < 11; i++) {
            segBut.addItem(new sap.m.SegmentedButtonItem(undefined, { text: "" + i, key: "" + i }));
        }

        parent.addItem(segBut);

        const boxTitles = new sap.m.HBox(undefined, {
            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
            width: "100%",
        });

        boxTitles.addItem(
            new nep.bootstrap.Text({
                text: definition.textLow,
                fontSize: "FontSize6",
                textColor: "Muted",
            })
        );

        boxTitles.addItem(
            new nep.bootstrap.Text({
                text: definition.textHigh,
                fontSize: "FontSize6",
                textColor: "Muted",
            })
        );

        parent.addItem(boxTitles);
    }

    export function SingleChoice(
        parent: ItemController,
        question: QuestionDefinition,
        modelResponseData: sap.ui.model.json.JSONModel
    ) {
        question.items.forEach((item) => {
            parent.addItem(
                new sap.m.RadioButton(undefined, {
                    text: item.title,
                    //@ts-ignore
                    selected: `{'ResponseData>/response/${question.id}'}`,
                    groupName: question.id,
                    select: function (oEvent) {
                        modelResponseData.getData().response[question.id] = item.id;
                    },
                })
            );
        });
    }

    export function MultipleChoice(
        parent: ItemController,
        question: QuestionDefinition,
        modelResponseData: sap.ui.model.json.JSONModel
    ) {
        const { validationType, validationParam } = question;
        const textVersion = {
            noLimit: "Please select all that apply",
            atLeast: "Please select at least",
            atMost: "Please select at most",
            equalTo: "Please select exactly",
        };
        const labelText =
            validationType === "noLimit"
                ? textVersion[validationType]
                : `${textVersion[validationType]} ${validationParam} options.`;

        question.items.forEach((item, index) => {
            parent.addItem(
                new sap.m.CheckBox(undefined, {
                    text: item.title,
                    //@ts-ignore
                    select: function (oEvent) {
                        if (!modelResponseData.getData().response[question.id]) {
                            modelResponseData.getData().response[question.id] = {};
                        }

                        if (this.getSelected()) {
                            modelResponseData.getData().response[question.id][item.id] = item.value;
                        } else {
                            delete modelResponseData.getData().response[question.id][item.id];
                        }
                    },
                })
            );
        });

        //@ts-ignore
        parent.addItem(new sap.m.Text({ text: labelText }));
    }

    export function Rating(parent: ItemController, definition: QuestionDefinition) {
        parent.addItem(
            new sap.m.RatingIndicator(undefined, {
                iconSize: "32px",
                maxValue: definition.levelsInt,
                visualMode: sap.m.RatingIndicatorVisualMode.Full,
                //@ts-ignore
                value: "{ResponseData>/response/" + definition.id + "}",
            })
        );
    }

    export function Likert(
        parent: ItemController,
        definition: QuestionDefinition,
        modelResponseData: sap.ui.model.json.JSONModel
    ) {
        const colProp = {
            width: "100px",
            hAlign: "Center",
            demandPopin: true,
            popinDisplay: "Block",
            minScreenWidth: "Large",
        };

        const tabLikert = new sap.m.Table(undefined, {
            alternateRowColors: false,
            fixedLayout: false,
            showSeparators: sap.m.ListSeparators.None,
            mode: sap.m.ListMode.None,
        });

        // Columns
        const col0 = new sap.m.Column();
        tabLikert.addColumn(col0);

        col0.setHeader(
            new nep.bootstrap.Text({
                //@ts-ignore
                text: definition.colTitle0,
                fontSize: "FontSize6",
                textColor: "Muted",
            })
        );

        //@ts-ignore
        const col1 = new sap.m.Column(colProp);
        tabLikert.addColumn(col1);

        col1.setHeader(
            new nep.bootstrap.Text({
                //@ts-ignore
                text: definition.colTitle1,
                textColor: "Muted",
            })
        );

        //@ts-ignore
        const col2 = new sap.m.Column(colProp);
        tabLikert.addColumn(col2);

        col2.setHeader(
            new nep.bootstrap.Text({
                //@ts-ignore
                text: definition.colTitle2,
                textColor: "Muted",
            })
        );

        //@ts-ignore
        const col3 = new sap.m.Column(colProp);
        tabLikert.addColumn(col3);

        col3.setHeader(
            new nep.bootstrap.Text({
                //@ts-ignore
                text: definition.colTitle3,
                textColor: "Muted",
            })
        );

        //@ts-ignore
        const col4 = new sap.m.Column(colProp);
        tabLikert.addColumn(col4);

        col4.setHeader(
            new nep.bootstrap.Text({
                //@ts-ignore
                text: definition.colTitle4,
                textColor: "Muted",
            })
        );

        //@ts-ignore
        const col5 = new sap.m.Column(colProp);
        tabLikert.addColumn(col5);

        col5.setHeader(
            new nep.bootstrap.Text({
                //@ts-ignore
                text: definition.colTitle5,
                textColor: "Muted",
            })
        );

        // Items
        definition.items.forEach(function (item, index) {
            const itemsLikert = new sap.m.ColumnListItem("questionItem" + item.id);

            itemsLikert.addCell(
                new nep.bootstrap.Text({
                    text: item.title,
                    fontSize: "FontSize6",
                    textColor: "Muted",
                })
            );

            [1, 2, 3, 4, 5].forEach((i) => {
                const formatterName = `format_${definition.id}_${index}_${i}`;
                window[formatterName] = (value) => {
                    return value === i;
                };

                itemsLikert.addCell(
                    new sap.m.RadioButton(undefined, {
                        groupName: item.id,
                        //@ts-ignore
                        selected: `{path:'ResponseData>/response/${definition.id}/${item.id}', formatter:'${formatterName}'}`,
                        select: function (oEvent) {
                            if (this.getSelected()) {
                                if (!modelResponseData.getData().response[definition.id]) {
                                    modelResponseData.getData().response[definition.id] = {};
                                }
                                modelResponseData.getData().response[definition.id][item.id] = i;
                            }
                        },
                    })
                );
            });

            tabLikert.addItem(itemsLikert);
        });
        //@ts-ignore
        parent.addItem(tabLikert);
    }
}
