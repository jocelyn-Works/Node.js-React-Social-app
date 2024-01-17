const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

// Récuperer tous les Utilisateurs
module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

// Récuperer toutes les donné d'un utilisateur
module.exports.userInfo = async (req, res) => {
  console.log(req.params);

  try {
    if (!ObjectID.isValid(req.params.id)) {
      return res.status(400).send("ID Inconnue : " + req.params.id);
    }

    const user = await UserModel.findById(req.params.id).select("-password");
    res.send(user);
  } catch (err) {
    console.log("ID Inconnue : " + err);
    res.status(500).json({ error: err.message });
  }
};

// Modification d'un utilisateur
module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID Inconnue : " + req.params.id);

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
          pseudo: req.body.pseudo,
          email: req.body.email,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select("-password");

    res.send(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Supresion d'un utlisisateur
module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID Inconnue : " + req.params.id);

  try {
    const result = await UserModel.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "supprimé avec succès." });
    } else {
      res.status(404).json({ message: "ID non trouvé." });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// follow d'un Utilisateur
module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID Inconnue : " + req.params.id);

  try {
    // Ajouter l'utilisateur cible à la liste des following
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );

    // Ajouter l'utilisateur actuel à la liste des followers de l'utilisateur cible
    const targetUser = await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    res.status(201).json({ updatedUser, targetUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// unfollow d'un Utilisateur
module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // Retirer l'utilisateur cible de la liste des following
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnFollow } },
      { new: true, upsert: true }
    );

    // Retirer l'utilisateur actuel de la liste des followers
    await UserModel.findByIdAndUpdate(
      req.body.idToUnFollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    res.status(201).json(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
