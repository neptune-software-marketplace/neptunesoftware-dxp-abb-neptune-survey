const data = await entities.survey_users.delete(req.query.id);

result.data = {
    status: "OK",
    message: "User Deleted"
};

complete();