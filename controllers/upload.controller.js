const UserModel = require("../models/user.model");
const fs = require("fs").promises;
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const { uploadErrors } = require("../utils/error.utils");
const path = require('path');

module.exports.uploadProfil = async (req, res) => {
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
  } catch (err) {
    const errors = uploadErrors(err);
    console.error('Error:', errors);
    return res.status(400).json({ errors });
  }

  // Utilisation de path.join pour construire le chemin du fichier
  const userId = req.body.userId;
  const fileName = req.body.name ? `${req.body.name}.jpg` : `user_${userId}.jpg`; // Utilisation du nom spécifié ou de l'ID de l'utilisateur
  const uploadDirectory = path.join(__dirname, '..', 'client', 'public', 'uploads', 'profil');
  const uploadPath = path.join(uploadDirectory, fileName);

  try {
    // Vérifier si le dossier existe, sinon le créer avec fs.promises
    await fs.mkdir(uploadDirectory, { recursive: true });

    // Vérifier si une photo existe déjà pour cet utilisateur
    const user = await UserModel.findById(userId);
    if (user && user.picture) {
      // Si une photo existe, supprimer l'ancienne photo
      const oldFilePath = path.join(uploadDirectory, user.picture.replace('./uploads/profil/', ''));
      await fs.unlink(oldFilePath);
    }

    // Utilisation de fs.promises.writeFile pour écrire le fichier
    await fs.writeFile(uploadPath, req.file.buffer);

    // Mise à jour de l'utilisateur dans la base de données avec le nouveau chemin de l'image
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { picture: `./uploads/profil/${fileName}` } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.send(updatedUser);
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).send({ message: err.message });
  }
};


// module.exports.uploadProfil = async (req, res) => {
//   try {
//     console.log('Detected Mimetype:', req.file.mimetype);
//     console.log('File Size:', req.file.size);

//     // Gestion du type de fichier autorisé
//     const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//     if (!allowedMimeTypes.includes(req.file.mimetype)) {
//       throw new Error('Invalid file format');
//     }

//     // Gestion de la taille maximale du fichier
//     if (req.file.size > 500000) {
//       throw new Error('File size exceeds maximum limit');
//     }
//   } catch (err) {
//     const errors = uploadErrors(err);
//     console.error('Error:', errors);
//     return res.status(400).json({ errors });
//   }

//   // Utilisation de path.join pour construire le chemin du fichier
//   const fileName = req.body.name + '.jpg';
//   const uploadDirectory = path.join(__dirname, '..', 'client', 'public', 'uploads', 'profil');
//   const uploadPath = path.join(uploadDirectory, fileName);

//   try {
//     // Vérifier si le dossier existe, sinon le créer avec fs.promises
//     await fs.mkdir(uploadDirectory, { recursive: true });

//     // Utilisation de fs.promises.writeFile pour écrire le fichier
//     await fs.writeFile(uploadPath, req.file.buffer);

//     // Mise à jour de l'utilisateur dans la base de données
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       req.body.userId,
//       { $set: { picture: './uploads/profil/' + fileName } },
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );

//     return res.send(updatedUser);
//   } catch (err) {
//     console.error('Error:', err.message);
//     return res.status(500).send({ message: err.message });
//   }
// };





// module.exports.uploadProfil = async (req, res) => {
//   try {
//     if (
//       req.file.detectedMimeType != "image/jpg" &&
//       req.file.detectedMimeType != "image/png" &&
//       req.file.detectedMimeType != "image/jpeg"
//     )
//       throw Error("invalid file");

//     if (req.file.size > 500000) throw Error("max size");
//   } catch (err) {
//     const errors = uploadErrors(err);
//     return res.status(201).json({ errors });
//   }
//   const fileName = req.body.name + ".jpg";

//   await pipeline(
//     req.file.stream,
//     fs.createWriteStream(
//       `${__dirname}/../client/public/uploads/profil/${fileName}`
//     )
//   );

//   try {
//     await UserModel.findByIdAndUpdate(
//       req.body.userId,
//       { $set : {picture: "./uploads/profil/" + fileName}},
//       { new: true, upsert: true, setDefaultsOnInsert: true},
//       (err, docs) => {
//         if (!err) return res.send(docs);
//         else return res.status(500).send({ message: err });
//       }
//     );
//   } catch (err) {
//     return res.status(500).send({ message: err });
//   }
// };

