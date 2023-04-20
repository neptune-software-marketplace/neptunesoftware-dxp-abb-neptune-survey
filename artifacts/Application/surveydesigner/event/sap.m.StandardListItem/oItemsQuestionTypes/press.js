const context = oEvent.oSource.getBindingContext();
const data = context.getObject();

formBuilder.addQuestion(data);
oPopoverQuestionMenu.close();