const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
    id: folder.id,
    fol_name: xss(folder.fol_name),
});

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
     .then (folders => {
        res.json(folders.map(serializeFolder))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name } = req.body

        if(req.body.name == null || req.body.name == '') {
            return res.status(400).json({
                error: { message: `Missing 'name' in request body`}
            })
        }
        const newFolder = { name }

        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getById(
            knexInstance,
            req.params.folder_id
        )
        .then(folder => {
            if(!folder) {
                return res.status(404).json({
                    error: { message: `Folder doesn't exist`}
                })
            }
            res.folder = folder
            next()
        })
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')

        FoldersService.deleteFolder(knexInstance, req.params.folder_id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name } = req.body


        if( name == null || name == '') {
            return res.status(400).json({
                error: {
                    message: `Request body must contain a value for 'name'`
                }
            })
        }

        const folderToUpdate = { name }
        
        FoldersService.updateFolder(knexInstance, req.params.folder_id, folderToUpdate)
            .then((updatedFolder) => {
                res.status(204).end()
                // res.status(200).json(updatedFolder)
            })
            .catch(next)
    })


module.exports = foldersRouter