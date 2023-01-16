//Importation du fichier jsonwebtoken pour pouvoir vérifier les token//
const jwt = require('jsonwebtoken');
//**Mise en place des variables d'environnements pour la sécurité**//
require('dotenv').config({ path: './ENV.env' })

module.exports = (req, res, next) => {
  //Utilisation de try et catch pour pouvoir gérer chaques lignes en cas de problème//
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
    next();  
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};