modelSurveyData.setData({
    name: "",
    description: "",
    questions: [],
    deleted: false,
    setup: {
        headerColor: "Info",
        textColor: "Light",
        backgroundImage: "",
    },
});

cockpitUtils.toggleCreate();
cockpitUtils.dataSaved = modelSurveyData.getJSON();

tabDetail.setSelectedItem(tabDetailInfo);
oApp.to(oPageDetail);
