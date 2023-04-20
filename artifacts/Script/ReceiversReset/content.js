let receiver = await entities.survey_receivers.findOne(req.query.id);
receiver.status = "1";

await entities.survey_receivers.save(receiver);

result.data = {
    status: "OK"
}
complete();
