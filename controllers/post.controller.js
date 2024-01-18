const postModel = require("../models/post.model");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.createPost = async (req, res) => {
  const newPost = new postModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.readPost = async (req, res) => {
    try {
      const docs = await PostModel.find();
      res.send(docs);
    } catch (err) {
      console.error("Erreur lors de la récupération des données : " + err);
      res.status(500).json({ message: "Erreur lors de la récupération des données" });
    }
  };

module.exports.updatePost = async (req, res) => {
    try {
      if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID Inconnue : " + req.params.id);
  
      const updatedRecord = {
        message: req.body.message,
      };
  
      const doc = await PostModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true }
      );
  
      if (doc) {
        res.send(doc);
      } else {
        res.status(404).send("Post non trouvé");
      }
    } catch (err) {
      console.error("Erreur de mise à jour : " + err);
      res.status(500).json({ message: "Erreur lors de la mise à jour du post" });
    }
  };

  module.exports.deletePost = async (req, res) => {
    try {
      if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID Inconnue : " + req.params.id);
  
      const deletedPost = await PostModel.findByIdAndDelete(req.params.id);
  
      if (deletedPost) {
        res.send(deletedPost);
      } else {
        res.status(404).send("Post non trouvé");
      }
    } catch (err) {
      console.error("Erreur de suppression : " + err);
      res.status(500).json({ message: "Erreur lors de la suppression du post" });
    }
  };
