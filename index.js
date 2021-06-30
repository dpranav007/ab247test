const prompts = require('prompts');
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const secretKey = 'sEcReTKey@1234';


(async () => {
    let currentPassword = null
    let currentUserEmail = null

    await prompts({
        type: 'text',
        name: 'init',
        message: 'Welcome! Let us assume this to be a single user system - user1@gmail.com. please say `next`',
        validate: value => value !== 'next' ? `you need to type - next` : true
    });

    try {
        let db = await fs.readJson('./db.json', {
            throws: false
        })
        currentPassword = db.password
        currentUserEmail = db.email
    } catch (e) {}


    if (!currentPassword || !currentUserEmail) {
        await prompts({
            type: 'text',
            name: 'setPassword',
            message: 'No default credentials set. We will set a default password for this user - 12345. please say `next`',
            validate: value => value !== 'next' ? `you need to type - next` : true
        });
        await fs.writeJson('./db.json', {
            email: 'user1@gmail.com',
            password: '12345'
        })
        currentPassword = '12345'
        currentUserEmail = 'user1@gmail.com'
    } else {
        await prompts({
            type: 'text',
            name: 'introduceUser',
            message: `Current user email is: ${currentUserEmail}, password is: ${currentPassword}. please say 'next'`,
            validate: value => value !== 'next' ? `you need to type - next` : true
        });
    }

    await prompts({
        type: 'text',
        name: 'askResetPassword',
        message: `Do you want to reset the password now? type yes/no`,
        validate: value => value !== 'yes' ? `c'mon this is what we have to do :p . say yes` : true
    });

    let tokenCreated = jwt.sign({
        email: currentUserEmail
    }, secretKey, {
        expiresIn: '1h'
    });

    await prompts({
        type: 'text',
        name: `tokenEmail`,
        message: `Cool! We have sent the reset link and token to the email id. Link is valid for 1 hr. The token in the email is: ${tokenCreated} - please copy this token(exactly, without any spaces around) string for further steps. type next`,
        validate: value => value !== 'next' ? `you need to type- next` : true
    });

    let response = await prompts({
        type: 'text',
        name: `submittedString`,
        message: `Enter the token & new password, separated by a space ie. [token] [new_password]`,
        validate: (value) => {
            let partsArray = value.split(' ')
            if (partsArray.length !== 2)
                return 'you need to submit in correct format'
            else return true
        }

    });

    let tokenSubmitted = response.submittedString.split(' ')[0]
    let newPassword = response.submittedString.split(' ')[1]

    try {
        let decoded = jwt.verify(tokenSubmitted, secretKey);
        if (decoded.email != currentUserEmail) throw 'user email mismatch'
        console.log("Token is verified correctly!")
        await fs.writeJson('./db.json', {
            email: currentUserEmail,
            password: newPassword
        })
        console.log("New password saved in database. Process ended")



    } catch (err) {
        console.log("Failed to verify token")
        console.log("Unable to reset to new password. Process ended")
    }
})();