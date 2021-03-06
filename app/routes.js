const User = require("./models/User.model");

module.exports = function(app, passport){
    app.use((req, res, next) => {
        app.locals.user = req.user // Récupération de l'objet 'user' (sera existant si une session est ouverte, et undefined dans le cas contraire)
        next()
    })

    // creation d'une route en get pour afficher Hello World :*
    app.get('/', function(req,res){
        // si on ne met pas la ligne res.setHeader le framework express mettre en place directement en Header cohérent avec ce qu'on envoie
        // ligne suivant a mettre en commentaire sinon PUG va interprété le header.
        // res.setHeader("Content-Type","text/plain");

        // render("[nomdufichier]",{paramètre utiliser dans le fichier index})
        res.render("index",{title : "Coucou", message : "Hello Babe !"});
    });

    app.get('/login', function(req,res){
        res.render("login");
    })

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        badRequestMessage: 'Identifiants nons valides!',
        failureFlash: true,
        successFlash: { message: 'Connexion réussie. Bienvenue !' }
    }));

    app.get('/auth/github', passport.authenticate('github'));
    app.get('/auth/github/callback', passport.authenticate('github', {
    	successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: { message: 'Connexion réussie avec Github. Bienvenue !' }
    }));

    app.get("/logout",(req,res)=>{
        req.logout();
        req.flash("success","déconnecté");
        res.redirect("/");
    });

    app.get('/register', function(req,res){
        res.render("register");
    })

    app.post('/register',function(req,res){
        User.register(
            req.body.firstname,
            req.body.lastname,
            req.body.email,
            req.body.pass,
            req.body.pass_confirmation
        ).then(()=>{
            req.flash("success", "vous etes bien inscrit. Vous pouvez maintenant vous connectez.");
            res.redirect("/") // redirection page d'accueil
        }).catch(errors => {
            res.render('register', { errors, user: req.body })
        });
        console.log(req.body);
    })
    
}