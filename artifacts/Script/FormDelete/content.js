let form = await entities.survey_form.findOne(req.query.id);

form.deleted = true;

await entities.survey_form.save(form);

result.data = {
    status: "OK",
    message: "Form Deleted"
};

complete();