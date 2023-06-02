const mongoose = require('mongoose');


const schema = mongoose.Schema ;

const message_schema = new schema({
    sender_id: String,
    receiver_id: String ,
    message: String ,
    createAt: {
        type: Date ,
        default: new Date().toUTCString()
    },
    value: Boolean
});


const Message = mongoose.model('messages' , message_schema);

module.exports =  {
    Message
}