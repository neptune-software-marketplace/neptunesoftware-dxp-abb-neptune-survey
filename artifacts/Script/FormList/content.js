const { Like, Any, IsNull } = operators;

const form = await entities.survey_form.find({
    where: [{ deleted: IsNull() }, { deleted: false }],
    order: { name: "ASC" },
});

result.data = {
    form,
};

complete();
