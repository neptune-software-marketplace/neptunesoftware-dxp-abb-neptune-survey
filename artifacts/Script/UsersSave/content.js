let users = [];

for (let i = 0; i < req.body.length; i++) {
    const user = req.body[i];

    // Exists ?
    const found = await entities.survey_users.findOne({
        surveyid: req.query.id,
        username: user.username,
    });

    if (!found) {
        users.push({
            surveyid: req.query.id,
            username: user.username,
        });
    }
}

await entities.survey_users.save(users);

result.data = {
    status: "OK",
    users: await entities.survey_users.find({
        surveyid: req.query.id,
        order: {
            username: "ASC"
        }
    }),
};

complete();
