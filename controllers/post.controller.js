const postModel = require("../models/post.model");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/error.utils");
const fs = require("fs").promises;
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const path = require('path');
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.createPost = async (req, res) => {
  try {
    console.log('Detected Mimetype:', req.file.mimetype);
    console.log('File Size:', req.file.size);

    // Gestion du type de fichier autorisé
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error('invalide file');
    }

    // Gestion de la taille maximale du fichier
    if (req.file.size > 500000) {
      throw new Error('max size');
    }

    // Vérifier si le dossier existe, sinon le créer avec fs.promises
    const uploadDirectory = path.join(__dirname, '..', 'client', 'public', 'uploads', 'posts');
    await fs.mkdir(uploadDirectory, { recursive: true });

    // Utilisation de fs.promises.writeFile pour écrire le fichier
    const fileName = `${req.body.posterId}${Date.now()}.jpg`;
    await fs.writeFile(path.join(uploadDirectory, fileName), req.file.buffer);

    const newPost = new postModel({
      posterId: req.body.posterId,
      message: req.body.message,
      picture: req.file != null ? `./uploads/posts/${fileName}` : "",
      video: req.body.video,
      likers: [],
      comments: [],
    });

    try {
      const post = await newPost.save();
      return res.status(201).json(post);
    } catch (err) {
      console.error('Error saving post to database:', err.message);
      // Supprimer le fichier partiellement écrit en cas d'échec
      await fs.unlink(path.join(uploadDirectory, fileName));
      return res.status(500).send({ message: 'Internal Server Error' });
    }

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(400).json({ errors: [err.message] });
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
      return res.status(404).send("Post non trouvé");
    }

    res.send(updatedPost);
  } catch (err) {
    console.error("Erreur lors de la suppression du commentaire: " + err);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du commentaire" });
  }
};
