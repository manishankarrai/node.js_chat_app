const mongoose = require('mongoose');
require('dotenv').config();

databaseConncetion().then(()=> console.log(`database conncetion successfully ..........`) )
.catch((err)=> console.log(`database conncetion fail ::  ` , err));


function databaseConncetion() {
 return mongoose.connect(process.env.url) ;
}

