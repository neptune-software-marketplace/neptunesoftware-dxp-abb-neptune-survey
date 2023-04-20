const context = oEvent.oSource.getBindingContext("MasterData");
const data = context.getObject();
formBuilder.getDetail(data.id);