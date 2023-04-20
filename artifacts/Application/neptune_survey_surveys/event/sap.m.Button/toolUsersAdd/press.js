sap.n.Planet9.openUsers(
    "Multi",
    function (users) {
        let newUsers = [];

        if (users) {
            users.forEach(function (user) {
                if (!user.selected) return;

                let exists = ModelData.FindFirst(modelSurveyMaster.oData.users, "id", user.id);

                if (!exists) {
                    newUsers.push(user);
                }                
            });
        }

        controller.addUsers(newUsers);
    },
    null,
    true
);
