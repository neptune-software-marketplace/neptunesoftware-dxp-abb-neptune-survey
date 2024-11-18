apiSurveySave({
    data: modelSurveyMaster.oData.survey,
}).then(function (res) {
    modelSurveyMaster.setData(res);
    modelSurveyMaster.refresh();
    toastStatus.setMessage("Survey Saved");
    toastStatus.clone().show();
    formBuilder.dataSaved = modelSurveyMaster.getJSON();
    apiMaster();
});
