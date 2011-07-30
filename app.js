
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var fb = require('facebook-js');
var FBMGR = require('./fbmgr');
var PORT = 9000;
var HOST = '0.0.0.0';

// Configuration

app.configure(function(){
    app.set('fb_app_id', process.env.FEEDBUILDER_FB_APP_ID);
    app.set('fb_app_secret', process.env.FEEDBUILDER_FB_APP_SECRET);
    app.set('fb_auth_url', 'http://local.host/connect/fb/auth');
    app.set('tw_api_key', process.env.FEEDBUILDER_TW_API_KEY);
    app.set('tw_consumer_secret', process.env.FEEDBUILDER_TW_CONS_SECRET);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: true});
    app.set('mongo_user', process.env.FEEDBUILDER_MONGO_USER);
    app.set('mongo_pwd', process.env.FEEDBUILDER_MONGO_PWD);
    app.use(express.bodyParser());
//  app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: process.env.FEEDBUILDER_SSN_SECRET }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

var tw = require('twitter-js')(app.set('tw_api_key'), app.set('tw_consumer_secret'));

// Routes

app.get('/', function(req, res){
  res.render('home', {title: 'FeedBuilder', subtitle: 'FeedBuilder', url: '/'});
});

app.get('/new/select-type/?', function(req, res){
    res.render('select-type', {title: 'Select Type', subtitle: 'Select Type', url: '/new/select-type/'});
});

app.get('/new/select-source/?', function(req, res){
    res.render('fb-select-source', {title: 'Select Source', subtitle: 'Select Source', url: '/new/select-source/'});
});

app.get('/new/select-source/me/?', function(req, res){
    res.render('fb-select-source', {title: 'Select Source', subtitle: 'Select Source', url: '/new/select-source/'});
});

app.get('/new/select-source/friends/?', function(req, res){
    FBMGR.renderSelectInstance(fb, req, res, '/me/friends', function(res, data){
        res.render('fb-select-source-friends', {title: 'Select Source', 
                                          subtitle: 'Select Source',
                                          url: '/new/select-source/',
                                          instanceArray: data});
    });
});

app.get('/new/select-source/pages/?', function(req, res){
    FBMGR.renderSelectInstance(fb, req, res, '/me/likes', function(res, data){
        res.render('fb-select-source-pages', {title: 'Select Source', 
                                          subtitle: 'Select Source',
                                          url: '/new/select-source/',
                                          instanceArray: data});
    });
});

app.get('/new/select-source/events/?', function(req, res){
    FBMGR.renderSelectInstance(fb, req, res, '/me/events', function(res, data){
        res.render('fb-select-source-events', {title: 'Select Source', 
                                          subtitle: 'Select Source',
                                          url: '/new/select-source/',
                                          instanceArray: data});
    });
});

app.get('/new/select-source/fb/:fbSource/:fbSourceItem', function(req, res){
    console.log('dans post...');
    if (req.params.fbSource) {
        console.log('fbSource=' + req.params.fbSource);
        switch (req.params.fbSource) {
            case 'me':
                console.log('ME!' + req.params.fbSourceItem);
                res.redirect('http://www.facebook.com/');
                break;
            
            case 'friend':
                console.log('FRIEND!' + req.params.fbSourceItem);
                res.redirect('http://www.facebook.com/' + req.params.fbSourceItem);
                break;
                
            case 'page':
                console.log('PAGE!' + req.params.fbSourceItem);
                res.redirect('http://www.facebook.com/' + req.params.fbSourceItem);
                break;
            
            case 'event':
                console.log('EVENT!' + req.params.fbSourceItem);
                res.redirect('http://www.facebook.com/' + req.params.fbSourceItem);
                break;
            default:
                // TODO : Manage exceptions...
        }
        
    }
    // TODO : Manage exceptions...
});

app.get('/connect/fb', function(req, res){
    // TODO : Detect if smartphone or big screen, for display: touch option.
    if (!req.session.fbToken)
    {
        res.redirect(fb.getAuthorizeUrl({
            client_id: app.set('fb_app_id'),
            redirect_uri: app.set('fb_auth_url'),
            scope: 'offline_access,read_stream',
            display: 'touch'
        }));
    }
    else
    {
        res.redirect('/new/select-source/');
    }
});

app.get('/connect/fb/auth', function(req, res){
    fb.getAccessToken(app.set('fb_app_id'), 
                      app.set('fb_app_secret'),
                      req.param('code'),
                      app.set('fb_auth_url'), 
                      function (error, access_token, refresh_token) {
                        //res.render('fb_test', {access_token: access_token, refresh_token: refresh_token, fb_wall: ''});
                        // TODO : Manage errors, if app not authorized, etc.
                        req.session.fbToken = access_token;
                        res.redirect('/new/select-source/');
                      });
});


// Only listen on $ node app.js
if (!module.parent) {
  app.listen(PORT);
  console.log("Express server listening on port %d", app.address().port);
}
