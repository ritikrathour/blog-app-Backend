 const dotenv = require("dotenv");
 dotenv.config({ path: "./.env" })
const DBConnection = require("./src/dataBase/index.js");
const app = require("./src/app.js");
// connecting data base 
DBConnection().then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at http://localhost:${process.env.PORT || 8000}`);
    })
}).catch((error)=>{
    console.log("server connection faild...", error);
})