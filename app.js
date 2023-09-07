const express = require('express');
const app = express();  
const hbs = require('hbs');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root', 
    password : '',
    database : 'bookshop' 
});

app.set('view engine','hbs');

const publicDir = path.join(__dirname);
app.use(express.static(publicDir+'/views/public'));

app.use(session({secret:'abcxyz'})); 

hbs.registerPartials(publicDir+'/views/partial');

app.use(express.urlencoded({extended:false}));

app.get('/adminlogin',(req,res)=>{ 
    res.render('adminlogin');
})

app.post('/loginadmin',(req,res)=>{
    const {email,pass} = req.body;
    db.query('SELECT *FROM admin WHERE email = ?',email,(err,result)=>{
        if(result.length == 0){  
            res.render('adminlogin',{  
                'message':'Sorry email does not exist'
            })
        } else { 
            if(result[0].password == pass){
                req.session.uname = result[0].id;
                res.render('admin');
            } else{
                res.render('adminlogin',{ 
                    'message':'Sorry password does not match'
                })
            }
        }
        })
})

app.get('/adminedit',(req,res)=>{
    db.query('SELECT *FROM admin WHERE id = ?',req.session.uname,(err,result)=>{
        res.render('adminedit',{
            'email' : result[0].email,  
            'pass' : result[0].password,   
        })
    })
})

app.post('/adminupdate',(req,res)=>{ 
    const{email,pass} = req.body;
    var id = req.session.uname;   

    db.query('UPDATE admin SET email = ?, password = ? WHERE id = ?',[email,pass,id],(err,result)=>{
        res.redirect('/adminedit');
    })
})

app.get('/author',(req,res)=>{ 

    if(!req.session.uname){
        res.render('adminlogin'); 
    } else {
        db.query('SELECT *FROM author ORDER BY id ASC',req.session.uname,(err,result)=>{
            res.render('author',{
                'author' : result
            }) 
        })
    }
}) 

app.post('/authoradd',(req,res)=>{
    const {name,birthday,address} = req.body;
 
        db.query('INSERT INTO author SET ?',{name:name,birthday:birthday,address:address},(err,result)=>{
            if(!err){
                res.redirect('author');
                
            } else {
                console.log(err);
            }  
        }) 
})

app.get('/books',(req,res)=>{ 

    if(!req.session.uname){
        res.render('adminlogin'); 
    } else {
        db.query('SELECT *FROM bookpost ORDER BY id ASC',req.session.uname,(err,result)=>{
            res.render('books',{
                'bookpost' : result
            }) 
        })
            // res.render('books');
    }
})

app.post('/submitpost',(req,res)=>{
    const {bname,author,publisher,year} = req.body;
    var uid = req.session.uname;
 
        db.query('INSERT INTO bookpost SET ?',{bname:bname,author:author,publisher:publisher,year:year},(err,result)=>{
            if(!err){
                res.redirect('books');
            } else {
                console.log(err);
            }  
        }) 
    
})

app.get('/adminlogout',(req,res)=>{ 
    res.render('adminlogin');   
})

app.get('/',(req,res)=>{

    if(!req.session.uname){
        res.redirect('/login');  
    } else {
        db.query('SELECT *FROM bookpost ORDER BY id ASC',req.session.uname,(err,result)=>{
            res.render('home',{
                'bookpost' : result
            }) 
        })
            // res.render('home');
    }
})  

app.get('/register',(req,res)=>{  
    res.render('register');
})

app.post('/submitform',(req,res)=>{
    const {uname,email,pass} = req.body;

    db.query('INSERT INTO users SET ?',{name:uname,email:email,password:pass},(err,result)=>{
        if(err == null){
            res.redirect('/login');
        } 
        else{
            res.render('register',{ 
                'message':'Something went wrong'
            })
        }
    }); 
}) 

app.get('/login',(req,res)=>{
    res.render('login');
    
})

app.post('/submitlogin',(req,res)=>{
    const {email,pass} = req.body;
    db.query('SELECT *FROM users WHERE email = ?',email,(err,result)=>{
        if(result.length == 0){  
            res.render('login',{ 
                'message':'Sorry email does not exist'
            })
        } else { 
            if(result[0].password == pass){
                req.session.uname = result[0].id;
                res.redirect("/");
            } else{
                res.render('login',{ 
                    'message':'Sorry password does not match'
                })
            }
        }
        })
})

app.post('/submitpost',(req,res)=>{ 
    const {upost} = req.body;
    var uid = req.session.uname;

    db.query('SELECT *FROM users WHERE id = ?',uid,(err,result)=>{
        var uname = result[0].name;
        db.query('INSERT INTO status SET ?',{uid:uid,uname:uname,post:upost},(err,result)=>{
            if(!err){
                res.redirect('/');
            } else {
                console.log(err);
            }
        })
    })
})

app.get('/useredit',(req,res)=>{  
    db.query('SELECT *FROM users WHERE id = ?',req.session.uname,(err,result)=>{
        res.render('useredit',{
            'uname' : result[0].name,  
            'email' : result[0].email, 
            'pass' : result[0].password,   
        })
    })
})

app.post('/userupdate',(req,res)=>{  
    const{uname,email,pass} = req.body;
    var id = req.session.uname;  

    db.query('UPDATE users SET name = ?, email= ?, password = ?, WHERE id = ?',[uname,email,pass,id],(err,result)=>{
        res.redirect('/useredit');
    })
})

app.get('/logout',(req,res)=>{
    res.render('login');
})

app.listen('5000',(req,res)=>{
    console.log('Server running on port 5000');
})