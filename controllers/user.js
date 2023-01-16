
//************************RECUPERATION ET IMPORTATION DES FICHIERS****************************************//

//Installation de bcrypt via le package node//
const bcrypt = require('bcrypt');
//Importation du fichier comprenant le token pour les users, ensuite il est stocké dans une variable//
const jwt = require('jsonwebtoken');
//Importation du fichier comprenant le model de l'objet user afin de pouvoir utiliser toutes les fonctions//
const user = require('../models/User');
const cookie = require ('cookie-parser');
const fs = require('fs');
//**Mise en place des variables d'environnements pour la sécurité**//
require('dotenv').config({ path: './ENV.env' })//****RegexMotDePasse*******//
//************************MIDDLEWARE SIGNUP**************************************************************//

//Création de la fonction signup ,de plus, elle sera exporté via exports dans le fichier "route/User" //
exports.signup = (req, res, next) => {
  console.log("petit test")
  //Le mot de passe doit comporter au moin 2 Majuscules, 1 minuscules, 2 chiffres et avoir une longueur de 10 au minimum//
  const regexPass = /^(?=.{10,}$)(?=(?:.*?[A-Z]){2})(?=.*?[a-z])(?=(?:.*?[0-9]){2}).*$/.test(req.body.password);
  console.log(regexPass);
  //Controle de l'adresse email//
  const regexEmail = /^([a-zA-Z0-9_\-\.]+)@([groupomania\b]{11})\.([fr]{2})$/.test(req.body.email);
  if(req.body.email) 
  console.log(regexEmail);
  //***Robustesse du mot de passe et controle de l'adresse email**// 
  if (regexEmail && req.body.email.includes("@groupomania.fr")){
    if(regexPass){
       //nous appelons la fonction de hachage de bcrypt dans notre mot de passe et lui demandons de « saler » le mot de passe 10 fois//
    bcrypt.hash(req.body.password, 10)
    //Récupération du hash du mot de passe qui sera enregistrer ensuite dans un nouveau user dans la base donnés//
    .then(hash => {
      //Création d'un constante userSinup, Cette constant comprend un nouvel objet avec un email et le mot de passe hasher et salé donc plus sécurisé// 
      const userSignup = new user({
        firstName : req.body.firstName,
        lastName : req.body.lastName,          
        email: req.body.email,
        password: hash,  
        job:req.body.job, 
        imageUrl : "https://img.myloview.fr/stickers/male-icon-vector-user-person-profile-avatar-in-flat-color-glyph-pictogram-illustration-400-163243023.jpg"
      });
      userSignup.save()
        .then(() => res.status(201).json({ message: 'utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
    } else{
      console.log("erreur mot de pass")
      res.status(401).json({ password: 'Le mot de passe doit comporter 2 Majuscules, 2 chiffres et 10 minuscules minimum !'});
    }  
  }
  else {
    console.log("erreur pour l'adresse email")
    res.status(401).json({ email: 'Votre email existe déjà où il ne se termine pas par "@groupomania.fr" ' });
  }
  //***L'utilisateur ne peut pas s'enregistrer**//
};

//************************MIDDLEWARE LOGIN**************************************************************//

//Création de la fonction login ,de plus, elle sera exporté via exports dans le fichier "route/User" //
exports.login = (req, res, next) => {
  //Trouver le user dans la base de donnés qui correspond à l'adresse email qui est rentré par l'utilisateur...
  // et si jamais l'utilisateur n'existe pas on renvoie un erreur//  
  //finOne pour trouver un seul utilisateur dans la base de donnés et comme l'adresse est unique alors ...
  //on trouvera obligatoirement la bonne adresse//
  //{Objet de comparaison, objet filtre}// 
  //Adresse mail == Adresse mail envoyé dans la requête//
  user.findOne({ email: req.body.email })
    //.then(user => = Est-ce qu'on a récupéré un user ou non?)// 
    .then(user => {
      //Si il n'y pas de user alors on revoie un 401//     
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      //Si il y a un user trouvé alors on utilisera bcrypte pour comparer...
      //le mot de passe envoyé par l'utilisateur qui essaye de se connecter avec le hash...
      //qui est enregistrer avec le user qu'on a reçu ligne46// 
      //On fait apel à la fonction compare pour comparer//
      //bcrypt.compare(mot de passe envoyé avec la requête,avec le hash qui est enregistré dans la base de donnés//           
      bcrypt.compare(req.body.password, user.password)
        //Dans le .then on reçois un boolean pour savoir si la comparaison est valable ou non//      
        .then(valid => {
          //If différent de valid (false) donc mot de passe incorrect//
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          //Sinon si true, on renvoie un status 200 ok + 
          //un objet json qui contient({
          //UserId : user._id = Identifiant de l'utilisateur //
          //token : jwt.sign = //
          //La connexion sera envoyé et donc validé//
          //)}//      
          //
          
          res.status(200).json({
            userId: user._id,
            //Importation de jsonwebtoken //
            //token :jwt.sign(
            //{id utilisateur du user comme ça on est sur que cette requête //
            //correspond à ce user Id l69, mais aussi pour éviter que d'autres utilisateurs puissent faire des modifications}//
            //{clé secrète pour l'encodage}//
            //{Expiration du token au bout de 24h}//
            token: jwt.sign(
              { userId: user._id },
              //**Token caché**/
              process.env.DATABASE_TOKEN,
              //**Durée du token caché**//
              { expiresIn: process.env.DATE_NOW }
            )            
          });          
        })
        .catch(error => res.status(500).json({ error }));
    })//erreur serveur (500)//
    .catch(error => res.status(500).json({ error }));
};
//GET USERS//
exports.getuser = (req,res) => {
  //l'adresse email et le mot de passe n'est pas GET//
  user.find({},{email:0,password:0})
  .then(user => res.status(200).json(user))
  .catch(error => res.status(400).json({ error }));
}
//GET USER//
exports.getOneUser = (req,res) => {
  console.log(' req.cookie=>')
  user.findOne({_id:req.params.id})  
  .then(user => res.status(200).json(user))
  .catch(error => res.status(400).json({ error }));
}

//UPLOAD IMG USER//
exports.uploadImg = (req,res)=>{ 
  console.log('upload test')
  user.findOne({_id :req.params.id})
  .then((objet) => {
    if(objet.imageUrl != "https://img.myloview.fr/stickers/male-icon-vector-user-person-profile-avatar-in-flat-color-glyph-pictogram-illustration-400-163243023.jpg"){
      console.log('Image ==>',objet)
      const UpdateImage = objet.imageUrl.split(`/images`)[1];
      console.log('split ==>',UpdateImage)
      fs.unlink(`images${UpdateImage}`, (error) => {
        if (error) throw error;
      })     
    }  
    console.log("image supprimée")
  }) 
  .catch(error => console.log( error ));
const userObject = 
{
  imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
};
//{Quel objet on modifie?},{Nouvelle version de l'objet modifié, Pour être sur d'avoir le même identifiant on le met en argument)}//
user.updateOne({ _id: req.params.id }, { ...userObject, _id: req.params.id })
  .then(() => res.status(200).json({ message: 'Objet modifié !' }))
  .catch(error => console.log( error ));
  console.log("update test")
}
//On récupére l'id de celui qui est connecté//

//Get pour obtenir le token//
  exports.getToken = (req,res) => {
    try {  
      const token = req.headers.cookie.split('token=')              
      //on créé une constante et dans le header de la requête on récupère authorization //         
      //nous utilisons ensuite la fonction verify pour décoder notre token. Si celui-ci n'est pas valide, une erreur sera générée //
      const decodedToken = jwt.verify(token[1], process.env.DATABASE_TOKEN);      
      //Une fois l'objet décodé, il se transforme en objet javascript classique, donc, on peut récupèrer le userId dedans(token)//
      const userId = decodedToken.userId;
      console.log('user =>',userId);   
      //L'objet userId est disponible dans la requête//
      //si la demande contient un ID utilisateur, nous le comparons à celui extrait du token. S'ils sont différents, nous générons une erreur//
      if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid user ID';
        //sinon on peut passer aux prochains middlewares// 
      } else {
         res.status(200).json((userId));     
      }
    } catch {
      res.status(401).json({
        error: new Error('Invalid request!')
      });
    }
  };    
  //LOGOUT//
  exports.logout = (req,res) => {  
    const token = req.headers.cookie.split('token=')
    res.clearCookie();     
    res.status(200).json(token[1]);   
  } 


