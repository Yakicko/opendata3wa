// CHARGE LES VARIABLES D'ENVIRONNEMENTs
require("dotenv").config();
// récupération d'express
const express = require("express");

// body-parser : fonction qui permettra de traiter les éléments de la requete
const bodyParser = require("body-parser"); 

const mongoose = require("mongoose");

// récupération de la methode dans une variable
const app = express();

const session = require('express-session');

const flash = require("connect-flash");

// indique a express que le moteur de templating a utiliser est pug
app.set("view engine","pug");

// indique a express que le dossier contenant les templates est "/views"
app.set("views","./views"); 

/**
 * Middleware des l'application
 */

// permet d'utiliser les fichiers static se trouvant dans le dossier public 
app.use(express.static('public'));
// grace a ca tous les éléments auront les méthodes body qui contiendra nos datas ca sera l'équivalent de $_POST
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    secret: 'opendata3wa rocks',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.use(flash());
app.use((req,res,next) => {
    app.locals.flashMessages = req.flash();
    next();
});

/**
 * Routes de l'application
 */

require("./app/routes")(app);

/**
 * Connexion à la base de données et démarrage de l'app
 */

mongoose
    .connect(`mongodb://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASS)}@${encodeURIComponent(process.env.MONGO_HOST)}:${encodeURIComponent(process.env.MONGO_PORT)}/${encodeURIComponent(process.env.MONGO_DBNAME)}`,{useNewUrlParser:true})
    .then(() =>{
    // serveur sur lequel je peux voir ce que j'envoie
    app.listen(9000,() => {
        console.info("serveur sur localhost:9000");
    });
})
