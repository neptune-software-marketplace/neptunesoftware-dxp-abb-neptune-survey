const { Not } = operators;

const survey = await entities.survey_master.findOne(req.query.surveyid);

if (!survey) {
    result.statusCode = 404;
    return complete();
}

const receiver = await entities.survey_receivers.findOne({
    surveyid: req.query.surveyid,
    id: req.query.link,
    status: Not("4")
});

let form = await entities.survey_form.findOne(survey.formid);

if (survey && receiver && form) {

    // Update Receiver Status
    if (receiver.status !== '4') {
        receiver.status = '3';
    }

    // Title & SubTitle
    if (survey.distribution.enableSurveyTitle) form.name = survey.name;
    if (survey.distribution.enableSurveySubTitle) form.description = survey.description;

    // Send data to Client
    await entities.survey_receivers.save(receiver);
    result.data = {
        form,
        survey
    };
}

complete();

