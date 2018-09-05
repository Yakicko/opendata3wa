var mongoose = require("mongoose");

const hash = require("./../hash");

var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname:  {type:String,required:[true, 'Le champs "prénom" est obligatoire']},
    lastname:   {type:String,required:[true, 'Le champs "nom" est obligatoire']},
    email : {
        type: String,
        required: [true, 'Le champs "email" est obligatoire'],
        validate: {
            validator: function(mailValue) {
                // c.f. http://emailregex.com/
                const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegExp.test(mailValue);
            },
            message: 'L\'adresse email {VALUE} n\'est pas une adresse RFC valide.'
        }
    },
    hash:       {type:String,required:true},
    salt:       {type:String,required:true},
});

userSchema.statics.register = function(firstname, lastname, email, pass, pass_confirmation){
    /*
    Insertion en base, en utilisant la méthode .create() d'un model mongoose
    c.f. https://mongoosejs.com/docs/api.html
    */ 
   const pass_errors = []

   if (pass.trim() === '')
       pass_errors.push('Le champs "mot de passe" est obligatoire')

   if (pass_confirmation.trim() === '')
       pass_errors.push('Le champs "confirmation de mot de passe" est obligatoire')

   if (pass_errors.length === 0 && pass.trim() !== pass_confirmation.trim())
       pass_errors.push('Les mots de passe doivent être identiques')

   if (pass_errors.length > 0)
       return Promise.reject(pass_errors)

    return this.findOne({ email: email })
        .then(user => {
            if (user)
                return Promise.reject(new Error(`Cette adresse email est déjà utilisée (${user.email})`));
        })
        .then(() => hash(pass))
        .then( ({salt, hash}) => {
        return this.create({
            firstname : firstname,
            lastname : lastname,
            email : email,
            salt : salt,
            hash : hash
        })
    }).catch(err => {
        // Fabrication d'un tableau de messages d'erreur (extraits de l'objet 'ValidationError' renvoyé par Mongoose)
        if (err.errors)
            throw Object.keys(err.errors).map(field => err.errors[field].message);
        
        throw [err.message ? err.message : err];
    })
    
};

module.exports = mongoose.model("User",userSchema);
