var FBMGR = {};
var STEP_FEED_SOURCE = 1, STEP_SOURCE_TYPE = 2, STEP_SOURCE_INSTANCE = 3, STEP_FILTER = 4, STEP_OTHER_PARAMS = 5;
var TYPE_FRIEND = 1, TYPE_PAGE = 2, TYPE_EVENT = 3, TYPE_MYFEED = 4, TYPE_MYWALL = 5;
var helper = {};

FBMGR.manageGetRequest = function(fb, req, res){
    if (req.query.back) {
        if (req.session.fbCurrentStep)
            req.session.fbCurrentStep--;
        else
            req.session.fbCurrentStep = STEP_FEED_SOURCE;
    }
    else {
        if (!req.session.fbCurrentStep)
            req.session.fbCurrentStep = STEP_SOURCE_TYPE;
        else
            req.session.fbCurrentStep++;
    }
    this.renderCurrentStep(fb, req, res);
};

FBMGR.renderCurrentStep = function(fb, req, res){
    switch(req.session.fbCurrentStep){
        case STEP_SOURCE_INSTANCE:
            switch (req.session.fbSourceType){
                case TYPE_FRIEND:
                    res.render('fb-select-friend', {friends: null});
                    break;
                case TYPE_PAGE:
                    res.render('fb-select-page', {pages: null});
                    break;
                case TYPE_EVENT:
                    break;
            }
            break;
        case STEP_FILTER:
            break;
        case STEP_OTHER_PARAMS:
            break;
        case STEP_FEED_SOURCE:
            res.redirect('home');
            break;
        default:
            res.render('fb-select-feed', {title: 'Select Facebook Feed Source', subtitle: 'Facebook Source'});
    }
};

helper.renderSelectInstance = function(fb, req, res, url, cb){
    fb.apiCall('GET', url, {access_token: req.session.fbToken}, 
                function (error, response, body) {
                    // TODO Manage errors...
                    if (body && body.data && body.data.length){
                        body.data.sort(function(a, b){
                            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                            if (nameA < nameB) //sort string ascending
                                return -1;
                            if (nameA > nameB)
                                return 1;
                            return 0; //default return value (no sorting)
                        });
                    }
                    cb(res, body.data);
                });
};

FBMGR.managePostRequest = function(fb, req, res){

    var managePostSourceType = function(fb, req, res){
        if (req.param('select-fb-source') == 'friendwall') {
            req.session.fbSourceType = TYPE_FRIEND;
            req.session.fbCurrentStep = STEP_SOURCE_INSTANCE;

            helper.renderSelectInstance(fb, req, res, '/me/friends', function(res, data){
                res.render('fb-select-instance', {title: 'Select Facebook Friend', 
                                                  subtitle: 'Facebook Friend',
                                                  infoText: 'Select the friend from whom wall posts will be included in the feed.',
                                                  instanceArray: data});
            });
        }
        else if (req.param('select-fb-source') == 'pagewall') {
            req.session.fbSourceType = TYPE_PAGE;
            req.session.fbCurrentStep = STEP_SOURCE_INSTANCE;

            helper.renderSelectInstance(fb, req, res, '/me/likes', function(res, data){
                res.render('fb-select-instance', {title: 'Select Facebook Page', 
                                                  subtitle: 'Facebook Page',
                                                  infoText: 'Select the page from which wall posts will be included in the feed.',
                                                  instanceArray: data});
            });
        }
        else if (req.param('select-fb-source') == 'eventwall') {
            req.session.fbSourceType = TYPE_EVENT;
            req.session.fbCurrentStep = STEP_SOURCE_INSTANCE;

            helper.renderSelectInstance(fb, req, res, '/me/events', function(res, data){
                res.render('fb-select-instance', {title: 'Select Facebook Event', 
                                                  subtitle: 'Facebook Event',
                                                  infoText: 'Select the event from which wall posts will be included in the feed.',
                                                  instanceArray: data});
            });
        }
        else if (req.params('select-fb-source') == 'myfeed') {
            req.session.fbSourceType = TYPE_MYFEED;
            req.session.fbCurrentStep = STEP_FILTER;
        }
        else {
            req.session.fbSourceType = TYPE_MYWALL;
            req.session.fbCurrentStep = STEP_FILTER;
        }
    };
    
    switch (req.session.fbCurrentStep){
        case STEP_SOURCE_TYPE:
            managePostSourceType(fb, req, res);
            break;
    }
};

module.exports = FBMGR;
