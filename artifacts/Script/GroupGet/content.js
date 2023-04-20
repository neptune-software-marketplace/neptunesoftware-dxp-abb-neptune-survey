result.data = await entities.survey_groups.findOne(req.query.id);
complete();
