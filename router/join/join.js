const express = require('express')
const router = express.Router()
const path = require('path')
const mysql = require("mysql");
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// DATABASE SETTING
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'practiceexpress'
})

connection.connect()

// ROUTER
router.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, '../../public/join.html'))
  let msg
  let errMsg = req.flash('error')
  if(errMsg)msg = errMsg
  res.render('join.ejs', {'message': msg})
})

passport.serializeUser((user, done) => {
  done(null, user.id)
})
passport.deserializeUser((id, done) => {
  done(null, id)
})

passport.use('local-join', new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
  passReqToCallback: true,
}, (req, id, password, done) => {
  const query = connection.query('select * from user where id =?', [id], (err, rows) => {
    if (err) {
      return done(err)
    }
    if (rows.length > 0) {
      return done(null, false, {message: '이미 존재하는 아이디입니다.'})
    } else {
      const sql = {id: id, name: req.body.name, password: password}
      let query1 = connection.query('insert into user set ?', sql, (err, rows) => {
        if (err) {
          return done(err)
        }
        return done(null, {'id': id, name: req.body.name, 'seq': rows.insertId})
      })
    }
  })
}))


router.post('/', passport.authenticate('local-join',
  {successRedirect: '/success', failureRedirect: '/join', failureFlash: true}
))

// 일반 post 연습
// router.post('/', (req, res) => {
//   const responseData = {}
//   const sql = {id: req.body.id, name: req.body.name, password: req.body.password}
//   const query = connection.query('insert into user set ?', sql, (err, rows) => {
//     if (err) {
//       throw err
//     }
//     res.render('welcome.ejs', {'name': req.body.name})
//   })
// })

module.exports = router