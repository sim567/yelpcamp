if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.SECRET);
console.log(process.env.API_KEY);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
//const { reviewSchema } = require('./schemas.js');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
//const Campground = require('./models/campground');
//const Review = require('./models/review');
const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const MongoDBStore = require('connect-mongodb-session')(session);
 
//const dbURL= process.env.DB_URL;
//process.env.DB_URL||
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl,{
     
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db= mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",() => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    collection: 'mySessions',
    expires: 1000 * 60 * 60 * 24 * 30
  
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e);
});

 const sessionConfig = {
    store,
     name: 'session',
     secret,
     resave: false,
     saveUnitialized: true,
     cookie: {
         httpOnly: true,
         //secure: true,
         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
         maxAge: 1000 * 60 *60 * 24 * 7,
     }
 }
 app.use(session(sessionConfig));
 app.use(flash());
 
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));

 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 app.use((req,res,next) => {
    //console.log(req.query);
     res.locals.currentUser = req.user;
     res.locals.success = req.flash('success');
     res.locals.error = req.flash('error');
     next();
 })

/* app.get('/fakeUser', async(req,res) => {
     const user = new User({email: 'colt@gmail.com', username:'chicken'});
     const newUser = await User.register(user, 'chicken');
     res.send(newUser);
 })*/

 app.use('/', userRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);

app.get('/',(req,res)=>{
res.render('home')
})

app.all('*',(req,res,next) =>{
    next( new ExpressError('page not found',404))
})
app.use((err,req,res,next) =>{
    const { statusCode = 500, message='something went wrong'} = err;
    if(!err.message)err.message = 'oh No ,something went wrong !'
    res.status(statusCode).render('error',{err});
});
//process.env||
const port = process.env.PORT || 3000
app.listen(port,()=>
{
    console.log(`serving on port ${port}`)
})