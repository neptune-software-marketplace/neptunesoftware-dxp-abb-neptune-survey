if (!!tabQuestions.getBinding("items")) {
    tabQuestions.getBinding("items").attachEventOnce("change", null, () => {
        const questions = tabQuestions.getItems();
        questions.forEach((question, i) => {
            const upButton = question?.getCells()[0].getItems()[1].getHeaderToolbar().getContent()[5];
            const downButton = question?.getCells()[0].getItems()[1].getHeaderToolbar().getContent()[6];

            if (upButton) upButton.setVisible(i !== 0);
            if (downButton) downButton.setVisible(i !== questions.length - 1);
        });
    });
}
