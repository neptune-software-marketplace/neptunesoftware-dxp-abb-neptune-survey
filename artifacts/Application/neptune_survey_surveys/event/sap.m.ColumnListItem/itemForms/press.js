const context = oEvent.oSource.getBindingContext("MasterData");
const data = context.getObject();

modelSurveyMaster.setData({
    survey: {
        name: "",
        description: "",
        formid: data.id,
        distribution: {
            emailTemplate: null,
            anonymous: true,
        },
    },
    receivers: [],
    responses: []
});

modelSurveyMaster.refresh();

cockpitUtils.dataSaved = modelSurveyMaster.getJSON();

cockpitUtils.toggleCreate();

oApp.to(oPageDetail);
