const { In } = operators;

let receiverFilter = req.body.receivers.map(function (receiver) {
    return receiver.id
});

const receivers = await entities.survey_receivers.find({
    id: In(receiverFilter)
});

const survey = await entities.survey_master.findOne({ id: req.body.surveyid });

receivers.forEach(async function (receiver) {

    const link = `${req.body.hostname}/public/app/surveysubmit?surveyid=${survey.id}&link=${receiver.id}`;

    let primitives = {
        surveyName: survey.name,
        description: survey.description,
        link: link,
    }

    const sendStatus = await sendEmail({
        to: receiver.email,
        subject: `${survey.name} Survey`,
        templateId: survey.distribution.emailTemplate,
        primitives: primitives
    });

    if (sendStatus && sendStatus.status === "error") {
        receiver.status = "9";
    } else {
        receiver.status = "2";
    }

    await entities.survey_receivers.save(receiver);

})

complete();
