const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const api = require('./api');
const bodyParser = require('koa-bodyparser');
const port = process.env.PORT || 4000;
require('dotenv').config();

//db
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(
    (response) => {
        console.log('Successfully connected to mongodb');
    }
).catch(e => {
    console.error(e);
});
//db

router.get('/', (ctx, next) => {
    ctx.body = "home";
});


app.use(bodyParser());
router.use('/', api.routes());
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
    console.log('server is listening to port ' + port);
});