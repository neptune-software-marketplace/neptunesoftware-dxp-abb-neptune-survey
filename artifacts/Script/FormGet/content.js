result.data = await entities.survey_form.findOne(req.query.id);
complete();
