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
    const docs = await PostModel.find().sort({ createdAt: -1 });
    res.send(docs);
  } catch (err) {
    console.error("Erreur lors de la récupération des données : " + err);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
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

module.exports.likePost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID Inconnue : " + req.params.id);

    // Mise à jour du post
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send("Post non trouvé");
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    res.send(updatedUser);
  } catch (err) {
    console.error("Erreur lors de la mise à jour des likes : " + err);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour des likes" });
  }
};

module.exports.unlikePost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID Inconnue : " + req.params.id);

    // Mise à jour du post
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send("Post non trouvé");
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    res.send(updatedUser);
  } catch (err) {
    console.error("Erreur lors de la mise à jour des likes : " + err);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour des likes" });
  }
};

module.exports.commentPost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID Inconnue : " + req.params.id);

    // Mise à jour du post avec le commentaire
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send("Post non trouvé");
    }

    res.send(updatedPost);
  } catch (err) {
    console.error("Erreur lors de la publication du commentaire: " + err);
    res
      .status(500)
      .json({ message: "Erreur lors de la publication du commentaire" });
  }
};

module.exports.editCommentPost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID Inconnue : " + req.params.id);

    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Post non trouvé");
    }

    const theComment = post.comments.find((comment) =>
      comment._id.equals(req.body.commentId)
    );

    if (!theComment) {
      return res.status(404).send("Commentaire non trouvé");
    }

    console.log("Comment avant modification:", theComment);

    theComment.text = req.body.text;

    console.log("Comment après modification:", theComment);

    const updatedPost = await post.save();

    console.log("Post après enregistrement:", updatedPost);

    res.status(200).send(updatedPost);
  } catch (err) {
    console.error("Erreur lors de la modification du commentaire: " + err);
    res
      .status(500)
      .json({ message: "Erreur lors de la modification du commentaire" });
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  try {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID Inconnue : " + req.params.id);

    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send('Post non trouvé');
    }

    res.send(updatedPost);
  } catch (err) {
    console.error("Erreur lors de la suppression du commentaire: " + err);
    res.status(500).json({ message: "Erreur lors de la suppression du commentaire" });
  }
};