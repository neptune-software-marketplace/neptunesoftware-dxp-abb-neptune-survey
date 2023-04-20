const context = oEvent.oSource.getBindingContext();
const data = context.getObject();

controller.addQuestion(data);
oPopoverQuestionMenu.close();