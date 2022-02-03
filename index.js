const TelegramBot = require("node-telegram-bot-api");
const { token } = require('./config');
const database = require('./modules/db')
const bot = new TelegramBot(token, {
    polling: true
})
const commands = {
    start: {
        register: "🎁 Ro'yxatdan o'tish",
        info: "ℹ Markaz xaqida ma'lumot"
    },
    answer: {
        yes: "Albatta!",
        no: "Yo'q"
    }
}
var deleter = false
functions = {
    start: message => {
        const chat_id = message.chat.id;
        bot.sendMessage(chat_id, `Salom ${message.chat.first_name}! Bizning botga xush kelibsiz!`, {
            reply_markup: JSON.stringify({
                keyboard: [
                    [{
                        text: commands.start.info
                    }, {
                        text: commands.start.register
                    }]
                ],
                resize_keyboard: true
            })
        })
    },
    message: message => {
        if (message.text == commands.start.register) {
            const chat_id = message.chat.id;
            // console.log(courses.map(course => { return { text: course.name } }));
            bot.sendMessage(chat_id, `Bizning markazimizda ${courses.map(course=>course.name).join(', ')} kurslarimiz bor! Qaysi kurs sizga maqul?`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        courses.map(course => { return { text: course.name, callback_data: course.name } })
                    ],
                    resize_keyboard: true
                })
            })
        } else if (message.text == '/deleter') deleter = !deleter
        else if (deleter) bot.deleteMessage(message.chat.id, message.message_id)
            // console.log(deleter);
    },
    register: query => {
        let array_to_delete = []
        let user = {
            course_name: query.data,
            user_name: '',
            phone_number: ''
        }
        bot.sendMessage(query.message.chat.id, 'Isming nmaAAAAAAA!!!!!!!', {
            reply_markup: {
                force_reply: true
            }
        }).then(payload => {
            array_to_delete.push([query.message.chat.id, query.message.message_id], [payload.chat.id, payload.message_id])
            let reply_listener = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
                // console.log(reply_listener);
                bot.removeReplyListener(reply_listener, msg.chat.id)
                user.user_name = msg.text
                bot.sendMessage(msg.chat.id, 'Nomering nechiiiii?????', {
                        reply_markup: JSON.stringify({
                            keyboard: [
                                [{
                                    text: 'Kontakni jo\'natish',
                                    request_contact: true
                                }]
                            ],
                            force_reply: true,
                            resize_keyboard: true,
                            one_time_keyboard: true
                        })
                    })
                    .then(payload => {
                        let reply_listener = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
                                user.phone_number = msg.contact.phone_number
                                array_to_delete.push([payload.chat.id, payload.message_id])
                                if (deleter)
                                    for (let item of array_to_delete) bot.deleteMessage(item[0], item[1])
                                bot.removeReplyListener(reply_listener)
                                bot.sendMessage(msg.chat.id,
                                        `Shu ma'lumotlar to'g'rimi:\nKurs: ${user.course_name}\nIsmingiz: ${user.user_name},\nTelefon raqamingiz: ${user.phone_number}`, {
                                            reply_markup: {
                                                keyboard: [
                                                    [{
                                                            text: commands.answer.yes
                                                        },
                                                        {
                                                            text: commands.answer.no
                                                        }
                                                    ]
                                                ],
                                                // keyboard_button_callback: (msg) => console.log('Hello ', msg),
                                                resize_keyboard: true,
                                            }
                                        })
                                    .then(payload => {
                                        bot.on('message', message => {
                                            console.log(message, query.message.chat);
                                            if (message.text == commands.answer.yes) {
                                                // if (!user.user_name || !user.phone_number) return bot.sendMessage(msg.chat.id, 'Forma xato to\'ldirilgan')
                                                DB.write('students', user)
                                                bot.sendMessage(query.message.chat.id, "Siz ro'yxatdan o'tdingiz", {
                                                    reply_markup: JSON.stringify({
                                                        keyboard: [
                                                            [{
                                                                text: commands.start.info
                                                            }, {
                                                                text: commands.start.register
                                                            }]
                                                        ],
                                                        resize_keyboard: true
                                                    })
                                                })
                                                return true;
                                            }
                                        });
                                    })
                            })
                            /**/
                    }).catch(reason => console.log('Rejected because: ' + reason))
            })
        })
    }
}
const DB = new database({
    courses: './DataBase/courses.json',
    students: './DataBase/students.json',
    teachers: './DataBase/teachers.json'
})
var courses = DB.read('courses')
    // console.log(12);
bot.onText(/\/start/, functions.start);
bot.on('message', functions.message);
bot.on('callback_query', functions.register)