const mongoose = require('mongoose');


const schema = mongoose.Schema ;

const group_schema = new schema({
    groupname: String , 
    groupcreatedby: String ,
    groupcreatedby_id: String ,
    groupadmin: String ,
    createAt: {
        type: Date ,
        default: new Date().toUTCString()
    }
});


const Group = mongoose.model('groups' , group_schema);

module.exports =  {
    Group
}