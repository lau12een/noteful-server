require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config');
const logger = require('./logger');
const notesRouter = require('./notes/notes-router');
const foldersRouter = require('./folders/folders-router');

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())


app.use('/api/folders', foldersRouter)
app.use('/api/notes', notesRouter)

app.get('/', (req, res) => {
    res.send('Noteful Server Running!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if(NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})


module.exports = app