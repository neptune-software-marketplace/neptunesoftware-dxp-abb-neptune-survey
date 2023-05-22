let receivers = [];

for (let i = 0; i < req.body.length; i++) {

    const email = req.body[i]

    // Exists ? 
    const found = await entities.survey_receivers.findOne({
        surveyid: req.query.id,
        groupid: req.query.groupid,
        email: email
    });

    if (!found && email) {
        receivers.push({
            email: email,
            surveyid: req.query.id,
            groupid: req.query.groupid,
            status: "1"
        })
    }

}
await entities.survey_receivers.save(receivers);

result.data = {
    status: "OK",
    receivers: await entities.survey_receivers.find({ surveyid: req.query.id })
};

complete();
