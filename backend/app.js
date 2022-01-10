const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { sequelize } = require('./models'); // db.sequelize
const collectionsRouter = require('./routes/collections');
const createRouters = require('./routes/create');
const nftsRouters = require('./routes/nfts');
const userRouter = require('./routes/user');
const metadataRouter = require('./routes/metadata');

const app = express();

app.set('port', process.env.PORT || 4000);
sequelize.sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결됨.');
    }).catch((err) => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/collections', collectionsRouter);
app.use('/create', createRouters);
app.use('/nfts', nftsRouters);
app.use('/user', userRouter);
app.use('/metadata', metadataRouter);



app.get('/', (req, res) => {
    res.json(`${req.method}: ${req.url}`);
})

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});


app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});