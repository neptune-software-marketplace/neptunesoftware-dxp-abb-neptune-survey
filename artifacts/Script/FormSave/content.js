try {
    result.data = await entities.survey_form.save(req.body);
    return complete();
} catch (e) {
    result.statusCode = 500;
    result.data = { status: e.message }
    return complete();
}