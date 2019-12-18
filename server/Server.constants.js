const loginInfo = require('./tokens.js')

module.exports.MONGODBADDRESS = `mongodb://${loginInfo.username}:${loginInfo.password}@ds353378.mlab.com:53378/caltrain-schedule`
