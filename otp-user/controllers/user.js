const { user, Sequelize } = require("../models"),
    moment = require('moment');
const Op = Sequelize.Op;

        // Generate a four-digit OTP
const generateOTP = async () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

// This will Create
module.exports.createUser = async (req, res, next) => {
    try {
        let { name, phone_number} = req.body;
        if(name != '' && phone_number != '') {
            const userData = {
                name: name,
                phone_number: phone_number
            };
            await user.create(userData).then(async function (user) {
                    return res.send({ 
                        success: true,
                        message: `User Created Successfuly!`
                    });
                }).catch(function (err) {
                    if(err && err.message == "Validation error") {
                        return res.send({ success: false, message: `User with ${email} is already exist. Try again with other valid email address, please!` });
                    }
                    return res.send({ success: false, message: err.message });
                });
        } else {
            res.send({ success: false, message: 'Name and Phone No required.' });
        }
    } catch (error) {
        next(error);
    }
}

// Generating OTP
module.exports.generateOTP = async (req, res, next) => {
    try {
        console.log(req.body)
        let { phone_number} = req.body;
        if(phone_number != '') {
            let userFind = await user.findOne({where: {phone_number: phone_number}});
            if(userFind){
            let OTP = await generateOTP();
            let expire = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss'); // Adjusted format
            const userData = {
                phone_number: phone_number,
                otp: OTP,
                otp_expiration_date: expire
            };
            await user.update(userData, {
                where: {
                    id: userFind.id,
                }
            }).then(async function (userOTP) {
                    return res.send({ 
                        success: true,
                        message: `User OTP is ${OTP} verify your account!`
                    });
            }).catch(function (err) {
                if(err && err.message == "Validation error") {
                    return res.send({ success: false, message: `User with ${email} is already exist. Try again with other valid email address, please!` });
                }
                return res.send({ success: false, message: err.message });
            });
            }else{
                return res.send({ 
                    success: false,
                    message: `User not found...!`
                });
            }
        } else {
            res.send({ success: false, message: 'Phone No required.' });
        }
    } catch (error) {
        next(error);
    }
}

// verify OTP 
module.exports.verifyOTP = async (req, res, next) => {
    try {
        let user_id = req.params.user_id;
        let otp = req.query.otp;
        let userFind = await user.findOne({
            where: {
                id: user_id,
                otp: Number(otp)
            }
        });
        if(userFind){
            const now = moment();
            const isExpired = moment(userFind.otp_expiration_date).isBefore(now);
            if (isExpired) {
                res.send({ success: false, message: 'Wrong OTP is provided or OTP Expired..!' });
            } else {
                res.send({ success: true, message: 'OTP Confirmed..!', data: userFind });
            }
        }else{
            res.send({ success: false, message: 'User Not found..!' });
        }
    } catch (error) {
        next(error);
    }
};