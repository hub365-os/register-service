require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const { Middlewares: { Authentication } } = require('@hub365-os/utility-nodejs');

const app = express();
app.set('trust proxy', true);

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const AuthenticationMiddleware = Authentication(path.join(__dirname, '../.jwt'));

const codeVerify = (request, response) => {
    const {
        identity,
    } = request.state;

    const codeVerifier = fs.readFileSync(path.join(__dirname, 'code_verifier.txt')).toString();
    const trueChallenge = crypto.createHash('SHA256').update(codeVerifier).digest('base64url');

    return response.status(200).send({ status: trueChallenge === identity.info.code_challenge });
};

app.get('/code_verify', (req, res, next) => { req.state = {}; return next(); }, AuthenticationMiddleware, codeVerify);

const port = process.env.PORT || 3000;
app.listen(
    port,
    () => {
        console.log(`Server is running on port ${ port }.`);
    },
);
