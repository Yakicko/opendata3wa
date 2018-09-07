const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const User = require('./models/User.model');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
      
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    const localStrategyConfig = {
        usernameField: 'email', // en fonction du name="" du champs input type text
        passwordField: 'pass'
    };

	passport.use(new LocalStrategy(localStrategyConfig, (email, password, done) => {
        
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                	// Invocation du handler done() de `passport` à la manière d'une erreur --> le middleware `passport.authenticate` répondra avec une erreur
                    done(null, false, {message: 'Adresse email invalide!'})
                    return Promise.reject() // fait également échouer notre chaîne de Promesses JS
                }
                return user;
            })
            .then(user => User.verifyPass(password,user))
            .then(user => {
            	// Si on est arrivé jusqu'ici sans erreur, c'est que les identifiants semblent valides.
                // ---> Fin de l'authentification, on transmet l'objet 'user' à la méthode done() de passport, et le middleware `passport.authenticate` répondra avec une nouvelle session user
                done(null, user);
            })
            .catch(err => {
                if (err)
                    done(null, false, {message: err.message});
            });
    }));

    passport.use(new GithubStrategy({
    	clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `http://${process.env.SERVER_NAME}:${process.env.SERVER_PORT}/auth/github/callback`
    },
        function(token, tokenSecret, profile, cb) {
        	
            console.log('PROFILE GITHUB', profile)
            User.signupViaGithub(profile)
                .then(user => cb(null, user))
                .catch(err => cb(err, false));
            
        }
    ));

}