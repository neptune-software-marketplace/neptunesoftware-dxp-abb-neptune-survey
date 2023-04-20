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

formBuilder.dataSaved = modelSurveyMaster.getJSON();
oApp.to(pageSurveyDetail);
