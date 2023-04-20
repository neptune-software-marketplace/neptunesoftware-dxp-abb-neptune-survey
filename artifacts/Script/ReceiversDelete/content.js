const data = await entities.survey_receivers.delete(req.query.id);

result.data = {
    status: "OK",
    message: "Receiver Deleted"
};

complete();