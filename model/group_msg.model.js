const mongoose = require('mongoose');


const schema = mongoose.Schema ;

const group_msg_schema = new schema({
    sender_id: String,
    group_id: String ,
    message: String ,
    createAt: {
        type: Date ,
        default: new Date().toUTCString()
    },
    value: Boolean
});


const GroupMsg = mongoose.model('groupmessages' , group_msg_schema);

module.exports =  {
    GroupMsg
}