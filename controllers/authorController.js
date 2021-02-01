const Author = require('../models/author');

var async = require('async');
var Book = require('../models/book');
const { body, validationResult } = require('express-validator');

exports.author_list = function (req, res, next) {

    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        });

};

exports.author_detail = (req, res) => {
    async.parallel({
        author: callback => {
            Author.findById(req.params.id)
                .exec(callback)
        },

        author_books: callback => {
            Book.find({ 'author': req.params.id }, 'title summary')
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {
            return next(err);
        }

        if (results == null) {
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }

        res.render('author_detail', { title: 'Author detail', author: results.author, author_books: results.author_books })
    }
    )
};

exports.author_create_get = function (req, res, next) {
    res.render('author_form', { title: 'Create Author' });
};
exports.author_create_post = [

    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {

            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                }
            );
            author.save(function (err) {
                if (err) { return next(err); }

                res.redirect(author.url);
            });
        }
    }

];

exports.author_delete_get = (req, res, next) => {
    async.parallel(
        {
            author: function (callback) {
                Author.findById(req.params.id).exec(callback)
            },
            authors_books: function (callback) {
                Book.find({ 'author': req.params.id }).exec(callback)
            },
        },

        function (err, results) {
            if (err) { return next(err); }

            if (results.author == null) {
                res.redirect('/catalog/authors');
            }

            res.render('author_delete', { author: results.author, author_books: results.authors_books })
        }

    );
};

exports.author_delete_post = (req, res, next) => {
    async.parallel(
        {
            author: function (callback) {
                Author.findById(req.body.authorid).exec(callback)
            },
            authors_books: function (callback) {
                Book.find({ 'author': req.body.authorid }).exec(callback)
            },

        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.authors_books.length > 0) {
                res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books });
                return;
            } else {
                Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                    if (err) { return next(err); }
                    // Success - go to author list
                    res.redirect('/catalog/authors')
                })
            }
        }
    )
};


exports.author_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update GET');
};


exports.author_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update POST');
};