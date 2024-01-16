const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password'); 
    res.status(200).json(users);
};

module.exports.userInfo = async (req, res) => {
    console.log(req.params);
    
    try {
        if (!ObjectID.isValid(req.params.id)) {
            return res.status(400).send('ID Inconnue : ' + req.params.id);
        }

        const user = await UserModel.findById(req.params.id).select('-password');
        res.send(user);
    } catch (err) {
        console.log('ID Inconnue : ' + err);
        res.status(500).json({ error: err.message });
    }
};


module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID Inconnue : ' + req.params.id);

    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    bio: req.body.bio,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).select('-password');

        res.send(updatedUser);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID Inconnue : ' + req.params.id);

        try {
            await UserModel.removeAllListeners({ _id: req.params.id }).exec();
            res.status(200).json({ message: "supprimé avec succès."});
        } catch (err) {
            return res.status(500).json({ message: err});
        }

}