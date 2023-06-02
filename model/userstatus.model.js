const mongoose = require('mongoose');


const schema = mongoose.Schema ;

const userstatus_schema = new schema({
    user_id: String,
    login_at : {
        type: Date ,
        require: false
    },
    logout_at: {
        type: Date ,
        require: false
    }
    
});



const Userstatus = mongoose.model('messages' , userstatus_schema);

module.exports =  {
    Userstatus
}