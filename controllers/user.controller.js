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

