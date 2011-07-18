
# Module dependencies.

express = require 'express'
app = module.exports = express.createServer
fb = require 'facebook-js'
FBMGR = require './fbmgr'
PORT = process.env.C9_PORT
HOST = '0.0.0.0'

# Configuration

app.configure ->
    app.set 'fb_app_id', '232900643387449'
    app.set 'fb_app_secret', 'e97c543c122215f2bdf0205a7ebb8fdd'
    app.set 'fb_auth_url', 'http://feedbuilder.puerkitobio.c9.io/connect/fb/auth'
    app.set 'tw_api_key', 'zSBcSFMdkIWda85cjWsrw'
    app.set 'tw_consumer_secret', '2CYyijpX8jFGugZtVCXia8yyyZcLKyiGKOQsumUI'
    app.set 'views', __dirname + '/views'
    app.set 'view engine', 'jade'
    app.set 'view options', {layout: true}
    app.use express.bodyParser()
    #app.use(express.methodOverride());
    app.use express.cookieParser()
    app.use express.session { secret: 'behemoth' }
    app.use app.router
    app.use express.static(__dirname + '/public')


app.configure 'development', ->
    app.use express.errorHandler({ dumpExceptions: true, showStack: true })


app.configure 'production', ->
    app.use express.errorHandler()


tw = require('twitter-js')(app.set('tw_api_key'), app.set('tw_consumer_secret'))

# Routes

app.get '/', (req, res) ->
  res.render 'home', {title: 'FeedBuilder', subtitle: 'FeedBuilder', url: '/'}

app.get '/new/select-type/?', (req, res) ->
    res.render 'select-type', {title: 'Select Type', subtitle: 'Select Type', url: '/new/select-type/'}

app.get '/new/select-source/?', (req, res) ->
    res.render 'fb-select-source', {title: 'Select Source', subtitle: 'Select Source', url: '/new/select-source/'}

app.get '/connect/fb', (req, res) ->
    # TODO : Detect if smartphone or big screen, for display: touch option.
    res.redirect fb.getAuthorizeUrl
        client_id: app.set 'fb_app_id'
        redirect_uri: app.set 'fb_auth_url'
        scope: 'offline_access,read_stream'
        display: 'touch'

app.get '/connect/fb/auth', (req, res) ->
    fb.getAccessToken app.set 'fb_app_id', app.set 'fb_app_secret', req.param 'code', app.set 'fb_auth_url', (error, access_token, refresh_token) ->
                        #TODO : Manage errors, if app not authorized, etc.
                        req.session.fbToken = access_token
                        res.redirect '/new/select-source/'

# Only listen on $ node app.js
if not module.parent
  app.listen PORT
  console.log "Express server listening on port %d", app.address().port
