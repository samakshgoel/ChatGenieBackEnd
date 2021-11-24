const jwt =  require('express-jwt')
// const jwt = require('jsonwebtoken');
const secret= process.env.JWT_Key;
const configjson= require("config.json");
const {getUser}= require('../model/query/query');
const {getAdmin} = require('../model/query/adminquery');


module.exports = authorize;

function authorize(roles = []) {

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret:secret, algorithms: ['HS256'] }),

        // authorize based on user role
        (req, res, next) => {
                        
            if (roles.length && !roles.includes(req.user.roles)) {
                // user's role is not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }
            switch (req.user.roles) {
            case 'User':
                getUser({Email:req.user.Email}).then(
                    user => {
                        if (user) {
                            req.user = user
                            req.userType = 'User'
                            next()
                        } else {
                        return res.status(404).json({ message: 'User Not Found' })
                        }
                    }
                )
            break
            case 'Admin':
				getAdmin({Email: req.user.Email}).then(
					user => {
						if (user) {
							req.user = user
							req.userType = 'Admin'
							next()
						} else {
							return res.status(404).json({ message: 'Admin Not Found' })
						}
					}
				)
				break
            default:
                return res.status(404).json({ message: 'User Not Found' })

            }
        }
    ]
}