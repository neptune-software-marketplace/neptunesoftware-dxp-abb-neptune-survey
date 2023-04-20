const context = oEvent.oSource.getBindingContext("SurveyData");
let questionIndex = context.sPath.split("/")[2];
controller.openQuestionMenu(this, questionIndex);