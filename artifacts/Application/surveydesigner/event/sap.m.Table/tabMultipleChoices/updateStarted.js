const context = oEvent.getSource().getBindingContext("SurveyData");
const data = context.getObject();
const length = data?.items?.length;

this.attachEventOnce("change", null, (oEvent) => {
    const select = this
        .getParent()
        .getItems()[1]
        .getContent()
        .filter((item) => item.sId.split("-")[0] === "selectValidationParam")[0];
    Utils.buildValParamSelect(select, length);
});

const paramSelect = this.getParent()
    .getItems()[1]
    .getContent()
    .filter((item) => item.sId.split("-")[0] === "selectValidationParam")[0];

Utils.buildValParamSelect(paramSelect, length);
