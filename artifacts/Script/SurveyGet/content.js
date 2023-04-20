let survey = await entities.survey_master.findOne(req.query.id);
let receivers = await entities.survey_receivers.find({ surveyid: survey.id });
let responses = await entities.survey_response.find({ surveyid: survey.id });
let users = await entities.survey_users.find({ surveyid: survey.id });

result.data = {
    survey,
    receivers,
    responses,
    users
}

complete();

