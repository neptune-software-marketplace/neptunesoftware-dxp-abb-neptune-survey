result.data = await entities.survey_receivers.find({ formid: req.query.surveyid });;
complete();
