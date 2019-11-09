const momentJS = require('moment');

const generateMessages =(text,userName) => {
    return {
        text: text,
        createdAt: momentJS(new Date().getTime()).format('h:mm a'),
        userName: userName
    }
}

module.exports = {
    generateMessages
}