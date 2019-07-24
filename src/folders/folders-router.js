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
        FoldersService.getAllFolders(req.app.get('db'))
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
        ;
    })
    .post(jsonParser, (req, res, next) => {
        // check fol_name exists
        if (!req.body[fol_name]) {
            logger.error(`fol_name is required to post`);
            return res.status(400).json({
                error: { message: `Missing 'fol_name' in request body` }
            })
        }

        const { fol_name } = req.body;
        const newFolder = { fol_name };
        FoldersService.insertFolder(req.app.get('db'), newFolder)
            .then(folder => {
                logger.info(`Folder with id ${folder.id} created`);
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
                ;
            })
            .catch(next)
        ;
    })
;

foldersRouter
    .route('/:id')
    .all((req, res, next) => {
        const id = req.params.id;
        FoldersService.getById(req.app.get('db'), id)
            .then(folder => {
                if (!folder) {
                    logger.error(`Folder with id ${id} not found`)
                    return res.status(404).json({
                        error: { message: `Folder not found` }
                    })
                }
                res.folder = folder;
                next()
            })
            .catch(next)
        ;
    })
    .get((req, res) => {
        res.json(serializeFolder(res.folder));
    })
    .delete((req, res, next) => {
        const id = req.params.id;
        FoldersService.deleteFolder(req.app.get('db'), id)
            .then(numRowsAffected => {
                logger.info(`Folder with id ${id} deleted`)
                res.status(204).end();
            })
            .catch(next)
        ;
    })
    .patch(jsonParser, (req, res, next) => {
        // check fol_name exists
        if (!req.body[fol_name]) {
            logger.error(`fol_name is required to patch`);
            return res.status(400).json({
                error: { message: `Missing 'fol_name' in request body` }
            })
        }
        
        const id = req.params.id;
        const { fol_name } = req.body;
        const folderUpdate = { fol_name };
        FoldersService.updateFolder(req.app.get('db'), id, folderUpdate)
            .then(numRowsAffected => {
                logger.info(`Folder with id ${id} updated`);
                res.status(204).end()
            })
            .catch(next)
        ;
    })
;

module.exports = foldersRouter;