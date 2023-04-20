await entities.survey_groups.delete(req.query.id);
result.data = {
    status: "OK",
    message: "Group Deleted"
};
complete();