const context = oEvent.oSource.getBindingContext("MasterData");
const data = context.getObject();

modeldiaGroups.setData(data);
diaGroups.open();
