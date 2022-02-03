payload => {
    let reply_listener = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
        bot.removeReplyListener(reply_listener)
        if (msg.text == 'yes') {
            if (!user.user_name || !user.phone_number) return bot.sendMessage(msg.chat.id, 'Forma xato to\'ldirilgan')
            DB.write('students', user)
            bot.sendMessage(query.message.chat.id, "Siz ro'yxatdan o'tdingiz")
            return true
        }
    })
}