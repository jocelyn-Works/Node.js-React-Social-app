const mongoose = require("mongoose");

mongoose
    .connect(
        "mongodb+srv://" + process.env.DB_USER_PASS + 
        "@cluster0.fzkzqym.mongodb.net/Projet_MERN_Social", // Modification : ajout de soulignés (_) pour l'espace dans le nom de la base de données
        // {
        //     useNewUrlParser: true, // Modification : "useNewUrlparser" à "useNewUrlParser"
        //     useUnifiedTopology: true, // Modification : "useUnifieldTopology" à "useUnifiedTopology"
        //     useCreateIndex: true,
        //     useFindAndModify: false
        // }
    )
    .then(() => console.log("Connecté à MongoDB"))
    .catch((err) => console.log("Échec de la connexion à MongoDB"));
