const selected = oEvent.getParameter("selectedKey");

if (selected === "preview") {
    controller.buildForm();
}

if (selected === "response") {
    formResponse.buildReport();
}
