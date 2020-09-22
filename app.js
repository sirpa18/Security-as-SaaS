
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const port = 3000
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
//const session = require('express-session')
const methodOverride = require('method-override')
var crypto = require('crypto');
const Jimp = require("jimp");
const path = require('path');
const stegger = require('./stegger');
const Sequence = require('futures').sequence;
const request = require('request');
const fs = require('fs');
const bodyParser = require('body-parser');
const keypair = require('keypair');
const keyconfig = require('./config/config');
const handle = require('./controller/handle')

/*
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)
*/
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
//app.use(require('express-session')({ 
  //secret: '[secret]', 
  //resave: false, 
  //saveUninitialized: false }));
//app.use(session({
  //secret: process.env.SESSION_SECRET,
  //resave: true,
  //saveUninitialized: true
//}))s
//app.use(passport.session())
app.use(express.static(__dirname + '/client'))
app.use(express.static(__dirname + '/watermarking'));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  res.render('login.ejs')
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
})
app.post('/login', (req, res) => {
  res.render('index.ejs')
})


//app.get('/register', checkNotAuthenticated, (req, res) => {
  //res.render('register.ejs')
//})
/*     
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.get('/home' , (req, res) => {
  req.home()
  res.redirect('/')
})

app.post('/home', (req, res)=>{
  successRedirect: '/',
  res.redirect('/')

})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


                                      /*      watermarking     */

app.get('/water', (req, res) => {
  //console.log("water")
  res.render('water.ejs')
})

app.post('/water',(req, res) => {

  let start  = process.hrtime();

  const LOGO_MARGIN_PERCENTAGE = 5;

const FILENAME = path.resolve(__dirname + "/watermarking/")+"/test.jpg";
console.log(FILENAME);

const main = async () => {

  const [image, logo] = await Promise.all([
    Jimp.read(req.body.url1),
    Jimp.read(req.body.url2)
  ]);
  
  logo.resize(image.bitmap.width / 10, Jimp.AUTO);

  const xMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;
  const yMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;

  const X = image.bitmap.width - logo.bitmap.width - xMargin;
  const Y = image.bitmap.height - logo.bitmap.height - yMargin;

  return image.composite(logo, X, Y, [
    {
      mode: Jimp.BLEND_SCREEN,
      opacitySource: 0.1,
      opacityDest: 1
    }
  ]);
};

main().then(image => {
  image.write(FILENAME);
  let end = process.hrtime(start);
  res.send("<h4>Time taken in seconds,millisec is   :   "+ end + " </h4><br><img src='test.jpg' width=200 height=200>");
});
})


                                       /*   hashing SHA_256   */

app.get('/hashing', (req, res) => {
  res.render('hash.ejs')
});

app.post('/hashing', (req, res) => {
  //creating hmac object 
  let start  = process.hrtime();
  var hmac = crypto.createHmac('sha256', 'yoursecretkeyhere');
  //passing the data to be hashed
  data = hmac.update(req.body.message);
  //Creating the hmac in the required format
  gen_hmac= data.digest('hex');
  //Printing the output on the console
  console.log("hmac : " + gen_hmac);
  let end = process.hrtime(start);
  res.send("<h4> Hashed message is :"+gen_hmac+" </h4> <br> <h4> Time taken in seconds,millisec is :    "+ end + " </h4>");
});


                                         /*     uniquekeys     */

app.get('/ukeys', (req, res) => {
  res.render('ukeys.ejs')
});

app.post('/ukeys',(req, res) => {
  let start  = process.hrtime();
  // Calling randomBytes method without callback 
const buf = crypto.randomBytes(60);  
  
// Prints random bytes of generated data 
console.log("The random bytes of data generated is: "
                + buf.toString('utf8')); 

  let end = process.hrtime(start);
  res.send("<h4> The Unique keys generated is : " + buf + " </h4> <br> Time taken in seconds,millisec is :   " + end + "</h4> ");
});


                                        /*    steganography    */

app.get('/stegger', (req, res) => {
  res.render('stegger.ejs')
});

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

app.post('/stegger-encrypt', (req,res) => {
  download(req.body.url, 'image.jpg', function(){
    Sequence()
      .then(function(next) {
          console.log('');
          console.log('--Testing ENCRYPT--')

          stegger.encrypt({
              inFile     : 'image.jpg',
              outFile    : 'output.jpg',
              msg        : req.body.message,
              key        : 'bla bla',
              method     : 'aes-256-cbc',
              passphrase : 'blue dog'
          })

          .when(function(err, data) {
              res.send('<img src="'+data+'" >');
          
          });

      })
});
  
})

app.post('stegger-decrypt', (req,res) => {
  Sequence().then(function(next, data) {
    console.log('--Testing DECRYPT--')
    stegger.decrypt({
        inFile     : 'output.jpg',
        outFile    : 'decrypted.txt',
        key        : 'bla bla',
        method     : 'aes-256-cbc',
        passphrase : 'blue dog'

    })

    .when(function(err, data) {
        if (err) {
            console.log(err);
        
        }
        res.send('<h4>Decrypted: '+data+'</h4>');

    });

});
})
                                /*      DIGITAL SIGNATURE    */

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');

let urlencodedParser = bodyParser.urlencoded({ extended: false })
let pair = keypair();
    keyconfig.set('publickey', pair.public);
    keyconfig.set('privatekey', pair.private);

//ROUTE
app.get("/digital-signature", function (req, res) {
    res.render('home', {public:keyconfig.get('publickey')});
});


app.get("/check", function (req, res) {
    res.render('check',{public:keyconfig.get('publickey'),  signature:keyconfig.get('signature'), message:keyconfig.get('message')
    });
});
app.post('/digital-signature', urlencodedParser, handle.generateSignature);
app.post('/check', urlencodedParser, handle.checkMessage);


app.listen(process.env.PORT || 8080);
