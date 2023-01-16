// in controllers/
const express = require('express');
const UserPost = require('../models/PostObject');
const fs = require('fs');
const User = require('../models/User');
const { userInfo } = require('os');
var reload = require('express-reload')
var jwt = require('jsonwebtoken');
const { find } = require('../models/PostObject');
const parse = require ('body-parser')
require('dotenv').config({ path: './ENV.env' });


//Mettre à jour un poste existant//
exports.updatePost = (req, res, next) => {
  console.log("bon endroit!")
  const cookieUser = req.headers.cookie.split(`token=`);
  const decodedToken = jwt.verify(cookieUser[1], process.env.DATABASE_TOKEN);   
  const userId = decodedToken.userId;
  //On récupére l'id de celui qui a enregistré sa sauce//
  console.log(req.body)
  UserPost.findOne({createdAt:req.body.createdAt})  
    .then((objet) => {
      console.log('objet====>',objet.userId)
          //*****Controle*****//
      if (objet.userId != userId && userId != process.env.ADMIN) {
        return res.status(403).json("unauthorized request");
      }
      //req.params == req.body.userId// 
      //Si l'utilisateur connecté et bien celui qui a posté //
      //Est ce qu'il y a un fichier de type File dans la requête envoyée?//
      else if (req.file) {
          UserPost.findOne({ createdAt :req.body.createdAt})//==> Identifiant de l'objet qui est dans l'url envoyé par le front//  
          .then((objet) => {
            console.log("_id:req.params.id CELUI LA 222 =>", objet.imageUrl)
            // avec le callback on récupère le nom de l'image//  
            if(objet.imageUrl != undefined ){
              const UpdateImage = objet.imageUrl.split(`/images`)[1];
              console.log(UpdateImage)
                  // Grâce à fs.unlik on supprime l'image du server//  
            fs.unlink(`images${UpdateImage}`, (error) => {
              if (error) throw error;
            })
            
            }       
          })
          .catch(error => res.status(400).json({ error }));
          //On extrait le nom de fichier à supprimer//    
      }      
      const thingObject = req.file ?
        {
            content : req.body.content,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`          
        } : { ...req.body };
        console.log('thingObject ====>',{thingObject})
      //{Quel objet on modifie?},{Nouvelle version de l'objet modifié, Pour être sur d'avoir le même identifiant on le met en argument)}//
      UserPost.updateOne({createdAt :req.body.createdAt}, { ...thingObject, userId: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
//   //On récupére l'id de celui qui est connecté//
};

//Rechercher un poste//
exports.onePost = (req, res, next) => {
  console.log("id=>");
  console.log(req.params.id)
  UserPost.findOne({ _id: req.params.id })//==> Identifiant de l'objet qui est dans l'url envoyé par le front//
    .then(post => res.status(200).json(post))
    .catch(error => res.status(404).json({ error }))
}

//Supprimer un poste//
exports.deletePost = (req, res, next) => {
  const cookieUser = req.headers.cookie.split(`token=`);
  const decodedToken = jwt.verify(cookieUser[1], process.env.DATABASE_TOKEN);   
  const userId = decodedToken.userId;
  UserPost.findOne({createdAt:req.body.createdAt})
    .then((objet) => {
      console.log('objet===>',objet)
      //*****Controle*****//
      if (objet.userId === userId || userId === process.env.ADMIN ) {
       if(!objet.imageUrl){
        UserPost.deleteOne({ createdAt :req.body.createdAt })
        .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
        .catch(error => res.status(400).json({ error }));
       //Trouver l'objet dans la base de donnés// 
       }  
       else{     
        UserPost.findOne({createdAt :req.body.createdAt})//==> Identifiant de l'objet qui est dans l'url envoyé par le front//
        //Quand on le trouve//
        .then(thing =>{
          //On extrait le nom de fichier à supprimer//
          const filename = thing.imageUrl.split(`/images/`)[1];
          //supprime l'image du server avec fs.unlink//
          fs.unlink(`images/${filename}`, () => {
            //Supprimer l'url du produit//  
            UserPost.deleteOne({ createdAt :req.body.createdAt })
              .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
              .catch(error => res.status(400).json({ error }));
          })
        })
        .catch(error => res.status(500).json({ error }));
       }   
      }
      else {
        res.status(400).json({ message: 'Mauvais userId !' })
      }
    })
    .catch(error => res.status(500).json({ error }))
}

//créer un poste //
exports.postMessage = (req, res, next) => {
  const cookieUser = req.headers.cookie.split(`token=`);
  const decodedToken = jwt.verify(cookieUser[1], process.env.DATABASE_TOKEN);   
  const userId = decodedToken.userId; 
  const post = req.body.post;
  if(userId){
    if(req.file){  
      console.log('req.file oui')
     const thing = new UserPost({
       userId:userId,
       content: req.body.content,   
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
       likes:  0,
       usersLiked:[],     
       ...post,    
     })
     thing.save()
     .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
     .catch(error => res.status(400).json({ error }));
   }
   else{ 
     console.log('req.file non')
     const thing = new UserPost({
       userId:userId,
       content: req.body.content, 
       likes:  0,
       usersLiked:[],    
       ...post,  
     });
     thing.save()
     .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
     .catch(error => res.status(400).json({ error }));}
 }else{
  console.log('Token Invalide')
 }
 ;
  }

//Avoir le tableau des sauces []//
exports.getMessages = (req, res, next) => {
  UserPost.find().sort({createdAt :-1}) 
     .then(SauceObject => res.status(201).json(SauceObject))
    .catch(error => res.status(400).json({ error }));
};

//******************************************//
// le système de like //
exports.postLikeDislike = (req, res, next) => {
  console.log("Vote en temps réél like: ", req.body.like);
  console.log("Id du produit selectionné : ", { _id: req.params.id });
  console.log("Id de l'utilisateur qui est connecté : ", {userId:req.body.userId});
  
  //********************ANALYSE DES DONNEES****************************************************///////// */

    //like//    
  UserPost.findOne({createdAt :req.body.createdAt})//Recherche de l'objet séléctionné par l'utilisateur//      
    .then((objet) => {
      console.log("user========= Like>", req.body.userId)
      console.log("userLike=====>", objet.usersLiked[0])
      console.log(req.body.like)
      if (!objet.usersLiked.includes(req.body.userId)) {
        console.log("executé11111");
        //Mise à jours de la base de donnée//
        UserPost.updateOne(
          {createdAt :req.body.createdAt},
          {
            $inc: { likes: +1 },
            $push: { usersLiked: req.body.userId }
          }
        )
          .then(() => res.status(200).json({ likes: 1 }))
          .catch(error => res.status(404).json(error))
      }

      if (objet.usersLiked.includes(req.body.userId)) {
        //Mise à jours de la base de donnée like//
        UserPost.updateOne(
          {createdAt :req.body.createdAt},
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId }
          }
        )
          .then(() => res.status(200).json({ likes: 0 }))
          .catch(error => res.status(404).json(error))
      }   
    })
}//==> End exports.postLikeDislike //


