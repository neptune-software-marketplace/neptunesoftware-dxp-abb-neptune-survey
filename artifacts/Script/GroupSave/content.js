try {
    result.data = await entities.survey_groups.save(req.body);
    return complete();
} catch (e) {
    result.statusCode = 500;
    result.data = { status: e.message }
    return complete();
}