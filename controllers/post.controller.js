const postModel = require('../models/post.model');
const PostModel =require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.createPost = (req, res) => {
    const newPost = new postModel({
        posterId: req.body.posterId,
        message: req.body
    })
};

module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log('erreur pour obtenir des données : ' + err);
    })
};

module.exports.updatePost = (req, res) => {
    
};

module.exports.deletePost = (req, res) => {
    
}