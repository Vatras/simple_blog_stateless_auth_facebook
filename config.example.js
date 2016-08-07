module.exports = {

    'secret': 'secretpasswordfortokensign',
    'database': 'mongodb://admin:password@MONGODB_IP/DATABASE_NAME',
    'facebook':{
        clientID: GET_FROM_DEVELOPERS.FACEBOOK.COM,
        clientSecret: GET_FROM_DEVELOPERS.FACEBOOK.COM,
        callbackURL: "http://SITE_NAME:3000/auth/facebook/callback"
    }

};
