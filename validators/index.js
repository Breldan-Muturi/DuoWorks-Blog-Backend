const {validationResult} = require('express-validator');

exports.runValidation = (req, res, next) => {  //Next is a callback function
    const errors = validationResult(req);
    if(!errors.isEmpty()) { //error stattus 422 is for unprocessible entity.
        return res.status(422).json({error: errors.array()[0].msg}); //We get the first error if there are any , this prevents us from having to loop through errors in the front end 
    }
    next(); //we execute this so that our application doesnt get halted
}

//We could now use this in routes.