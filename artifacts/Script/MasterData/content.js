const { Like, Any, IsNull } = operators;

const manager = p9.manager || modules.typeorm.getConnection().manger;

const emailTemplates = await manager.find("wf_notifications", {
    select: ["name", "description", "id"],
    order: { name: "ASC" },
});

const form = await entities.survey_form.find({
    where: [{ deleted: IsNull() }, { deleted: false }],
    order: { name: "ASC" },
});

const survey = await entities.survey_master.find({
    select: [
        "name",
        "description",
        "id",
        "updatedAt",
        "updatedBy",
        "protected",
        "createdAt",
        "createdBy",
    ],
    order: {
        name: "ASC",
    },
});

const groups = await entities.survey_groups.find({
    order: { name: "ASC" },
});

const status = await entities.survey_status.find({
    order: { name: "ASC" },
});

// Check for protected mode
let surveyToSee = [];

for (let i = 0; i < survey.length; i++) {
    const surveyData = survey[i];

    if (surveyData.protected) {
        let showSurvey = false;

        if (surveyData.createdBy === req.user.username) showSurvey = true;

        if (!showSurvey) {
            const permission = await entities.survey_users.findOne({
                surveyid: surveyData.id,
                username: req.user.username,
            });

            if (permission) showSurvey = true;
        }

        if (showSurvey) surveyToSee.push(surveyData);
    } else {
        surveyToSee.push(surveyData);
    }
}

result.data = {
    form,
    status,
    groups,
    survey: surveyToSee,
    emailTemplates,
    user: {
        username: req.user.username,
    },
};

complete();
