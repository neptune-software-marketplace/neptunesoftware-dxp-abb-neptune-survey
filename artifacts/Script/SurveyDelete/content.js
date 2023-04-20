await entities.survey_master.delete(req.query.id);
await entities.survey_receivers.delete({ surveyid: req.query.id });
await entities.survey_response.delete({ surveyid: req.query.id });
result.data = {
    status: "OK",
    message: "Survey Deleted"
};
complete();