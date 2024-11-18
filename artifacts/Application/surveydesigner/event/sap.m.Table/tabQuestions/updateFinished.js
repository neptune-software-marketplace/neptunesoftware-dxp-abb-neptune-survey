if (!!tabQuestions.getBinding("items")) {
    tabQuestions.getBinding("items").attachEventOnce("change", null, () => {
        const questions = tabQuestions.getItems();
        questions.forEach((question, i) => {
            const upButton = question
                ?.getCells()[0]
                .getItems()[1]
                .getHeaderToolbar()
                .getContent()
                .filter((item) => item.sId.split("-")[0] === "questionToolbarUp")[0];
            const downButton = question
                ?.getCells()[0]
                .getItems()[1]
                .getHeaderToolbar()
                .getContent()
                .filter((item) => item.sId.split("-")[0] === "questionToolbarDown")[0];
            upButton.setVisible(i !== 0);
            downButton.setVisible(i !== questions.length - 1);
        });
    });
}
