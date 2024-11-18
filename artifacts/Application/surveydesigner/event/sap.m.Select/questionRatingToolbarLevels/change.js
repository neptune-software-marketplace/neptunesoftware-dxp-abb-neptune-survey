const context = oEvent.oSource.getBindingContext("SurveyData");
let data = context.getObject();

data.levelsInt = parseInt(this.getSelectedKey());
modelSurveyData.refresh();
