try {
    let survey = await entities.survey_master.save(req.body)
    let receivers = await entities.survey_receivers.find({ surveyid: survey.id });
    let responses = await entities.survey_response.find({ surveyid: survey.id });

    result.data = {
        survey,
        receivers,
        responses
    }

    complete();

} catch (e) {
    result.statusCode = 500;
    result.data = { status: e.message }
    complete();
}