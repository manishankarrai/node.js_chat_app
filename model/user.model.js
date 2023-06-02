const mongoose = require('mongoose');


const schema = mongoose.Schema ;
 
const user_contact = {
    usercontact: String ,
    usercontact_id: String ,
    _id: {
        type: String ,
        require: false
    }
}
 
const user_group = {
    usergroup: String ,
    usergroup_id: String ,
    _id: String
}
const user_schema = new schema({
    username: String ,
    useremail: String ,
    password: String ,
    createAt: {
        type: Date ,
        default: new Date().toUTCString()
    } ,
    user_contact : [user_contact],
    user_group: [user_group]
});


const User = mongoose.model('users' , user_schema);

module.exports =  {
    User
}