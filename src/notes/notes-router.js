const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    content: xss(note.content),
    date_modified: note.date_modified,
    fol_id: note.fol_id,
});

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
        ;
    })
    .post(jsonParser, (req, res, next) => {
        const { note_name, content, date_modified, fol_id } = req.body;

        const newNote = { note_name, fol_id };
        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                logger.error(`${key} is required to post`);
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }
        newNote.content = content;
        newNote.date_modified = date_modified;

        NotesService.insertNote(req.app.get('db'), newNote)
            .then(note => {
                logger.info(`Note with id ${note.id} created`);
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
                ;
            })
            .catch(next)
        ;
    })
;

notesRouter
    .route('/:id')
    .all((req, res, next) => {
        const id = req.params.id;
        NotesService.getById(req.app.get('db'), id)
            .then(note => {
                if (!note) {
                    logger.error(`Note with id ${id} not found`)
                    return res.status(404).json({
                        error: { message: `Note not found` }
                    })
                }
                res.note = note;
                next()
            })
            .catch(next)
        ;
    })
    .get((req, res) => {
        res.json(serializeNote(res.note));
    })
    .delete((req, res, next) => {
        const id = req.params.id;
        NotesService.deleteNote(req.app.get('db'), id)
            .then(numRowsAffected => {
                logger.info(`Note with id ${id} deleted`)
                res.status(204).end();
            })
            .catch(next)
        ;
    })
    .patch(jsonParser, (req, res, next) => {
        const { note_name, content, date_modified, fol_id } = req.body;
        const id = req.params.id;
        const noteToUpdate = { note_name, content, fol_id };

        // check that one of name, content, and/or folder id is present to update
        // just date_modified without other modifications would not be enough to update note
        const valuesToUpdate = Object.values(noteToUpdate).filter(Boolean).length;
        if (valuesToUpdate === 0) {
            logger.error(`Request body must contain 'note_name', 'content', or 'fol_id' to patch`);
            return res.status(400).json({
                error: { message: `Request body must contain 'note_name', 'content', or 'fol_id'` }
            })
        }

        // set date_modified to either what was sent in request or now
        noteToUpdate.date_modified = date_modified ? date_modified : new Date();

        NotesService.updateNote(req.app.get('db'), id, noteToUpdate)
            .then(numRowsAffected => {
                logger.info(`Note with id ${id} updated`);
                res.status(204).end()
            })
            .catch(next)
        ;
    })
;

module.exports = notesRouter;