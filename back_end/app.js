const express = require('express');
const app = express();

// express setup

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});


let endPointRoot = '/COMP4537/assignment/1/gold';

// mysql setup

const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "kmilanca_user1",
    password: "ISFd?xp}ZbUK",
    database: "kmilanca_assignment1gold"
});

// express events

app.get(endPointRoot + '/admin/quizzes', (req, res) => {
    let sql = 'select * from `quizzes`';
    db.query(sql, function (err, result) {
        if (err) throw err;
        res.json(result);
    })
});

app.post(endPointRoot + '/admin/quizzes', (req, res) => {
    let sql = `insert into quizzes (name) values ("${req.body.name}")`;
    db.query(sql, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

app.put(endPointRoot + '/admin/questions', (req, res) => {
    let question_id = req.body.question_id;
    let quiz_id = req.body.quiz_id;
    let question = req.body.question;
    let choices = req.body.choices;
    let sql = `update questions set question = "${question}" where question_id = ${question_id};`;
    db.query(sql, function (err, result) {
        if (err) throw err;
        sql = [];

        for (let i = 0; i < choices.length; i++) {
            sql[i] = `update choices set choice="${choices[i].choice}", answer=${choices[i]['answer']} where choice_id=${choices[i]['choice_id']};`;
        }

        new Promise((resolve, reject) => {
            if (sql.length == 0)
                resolve('no questions');
            for (let i = 0; i < sql.length; i++) {
                db.query(sql[i], (err1, result1) => {
                    result['choices'] = result1;
                    if (i == sql.length - 1) {
                        resolve('pass');
                    }
                });
            }
        }).then((resp) => {
            res.json(result);
        })
    });
});

app.post(endPointRoot + '/admin/questions', (req, res) => {
    let question = req.body.question;
    let quiz_id = req.body.quiz_id;
    let choices = req.body.choices;

    let ret = {};
    // Insert Questions
    let sql = `insert into questions (question, quiz_id) values ("${question}", ${quiz_id});`;
    db.query(sql, function (err, result) {
        if (err) throw err;
        ret['question_id'] = result.insertId;
        ret['choices'] = [];

        // Insert Choices
        if (choices.length > 0) {
            sql = `insert into choices (choice, question_id, answer) values ("${choices[0]['choice']}", ${result.insertId}, ${choices[0]['answer']}),`;

            for (let i = 1; i < req.body["choices"].length; i++) {
                sql += `("${choices[i]['choice']}", ${ret['question_id']}, ${choices[i]['answer']})`
                if (i == req.body["choices"].length - 1) {
                    sql += ';'
                }
                else {
                    sql += ',';
                }
            }

            db.query(sql, function (err1, result1) {
                for (let i = 0; i < result1.affectedRows; i++) {
                    ret.choices[i] = result1.insertId + i;
                }
                res.json(ret);
            });
        }
    });
});

app.get(endPointRoot + '/admin/quizzes/questions', (req, res) => {
    let quiz_id = req.query.quiz_id;
    let sql = `select * from \`questions\` where quiz_id=${quiz_id}`;
    let questions = null;
    db.query(sql, function (err, result) {
        if (err) throw err;
        questions = result;

        sql = [];
        for (let i = 0; i < result.length; i++) {
            sql[i] = `select * from choices where question_id=${result[i].question_id};`
        }

        new Promise((resolve, reject) => {
            for (let i = 0; i < sql.length; i++) {
                db.query(sql[i], (err1, result1) => {
                    result[i]['choices'] = result1;
                    if (i == result.length - 1) {
                        resolve('pass');
                    }
                });
            }
            if (sql.length == 0)
                resolve('no questions')
        }).then((resp) => {
            res.json(result);
        })

    });
});

app.get(endPointRoot + '/student/quizzes', (req, res) => {
    let sql = `insert into quizzes (name) values ("${req.body.name}")`;
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});

app.get(endPointRoot + '/student/quizzes/questions', (req, res) => {
    let quiz_id = req.query.quiz_id;
    let sql = `select * from \`questions\` where quiz_id=${quiz_id}`;
    let questions = null;
    db.query(sql, function (err, result) {
        if (err) throw err;
        questions = result;

        sql = [];
        for (let i = 0; i < result.length; i++) {
            sql[i] = `select * from choices where question_id=${result[i].question_id};`

        }

        new Promise((resolve, reject) => {
            for (let i = 0; i < sql.length; i++) {
                db.query(sql[i], (err1, result1) => {
                    result[i]['choices'] = result1;
                    for (let j = 0; j < result1.length; j++) {
                        if (result1[j]['answer'] == true) {
                            result[i]['answer'] = result1[j]['choice_id'];
                        }
                    }
                    if (i == result.length - 1) {
                        resolve('pass');
                    }
                });
            }
            if (sql.length == 0)
                resolve('no questions')
        }).then((resp) => {
            res.json(result);
        })
    });
});

// start a server

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});


