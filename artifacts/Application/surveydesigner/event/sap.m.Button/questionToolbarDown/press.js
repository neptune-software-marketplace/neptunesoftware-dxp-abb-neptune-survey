const questions = modelSurveyData.getData().questions;
const context = oEvent.getSource().getBindingContext("SurveyData");
const questionIndex = Number(context.sPath.split("/")[2]);
const targetIndex = questionIndex + 1;

if (questionIndex === questions.length - 1) {
    return;
}
const questionAtCurrentIndex = questions[questionIndex];
const questionAtTargetIndex = questions[targetIndex];

questions[questionIndex] = questionAtTargetIndex;
questions[targetIndex] = questionAtCurrentIndex;

modelSurveyData.refresh();
