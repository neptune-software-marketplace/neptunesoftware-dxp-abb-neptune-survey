const { Not } = operators;

const survey = await entities.survey_master.findOne(req.body.surveyid);

const receiver = await entities.survey_receivers.findOne({
    surveyid: req.body.surveyid,
    id: req.body.link,
});


if (survey && receiver) {

    // Receiver Status
    receiver.status = "4";
    await entities.survey_receivers.save(receiver);

    let response = {
        surveyid: req.body.surveyid,
        response: req.body.response,
        groupid: receiver.groupid
    }

    if (!survey.distribution.anonymous) {
        response.email = receiver.email;
    }

    // Response
    response.createdBy = "system";
    response.updatedBy = "system";
    response.createdAt = new Date("11-07-2011");
    response.updatedAt = new Date("11-07-2011");

    await entityManager.save("survey_response", response);

    result.data = {
        status: "OK"
    };

} else {

    result.data = {
        status: "ERROR",
        message: "Survey or Receiver is not Active",
        survey,
        receiver
    };

}

complete();