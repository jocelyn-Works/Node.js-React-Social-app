const mongoose = require("mongoose");

mongoose
    .connect(
        "mongodb+srv://" + process.env.DB_USER_PASS + 
        "@cluster0.fzkzqym.mongodb.net/Projet_MERN_Social",
        // {
        //  useNewUrlParser: true,
        //  useUnifiedTopology: true,
        //  useCreateIndex: true,
        //  useFindAndModify: false
        // }
    )
    .then(() => console.log("Connecté à MongoDB"))
    .catch((err) => console.log("Échec de la connexion à MongoDB"));
