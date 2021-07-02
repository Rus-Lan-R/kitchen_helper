// обработчик события присылания нам любого сообщения
bot.on("message", (msg) => {
	const chatId = msg.chat.id; //получаем идентификатор диалога, чтобы отвечать именно тому пользователю, который нам что-то прислал

	// отправляем сообщение
	bot.sendMessage(chatId, "Привет,!?", {
		// прикрутим клаву
		reply_markup: {
			inline_keyboard: keyboard,
		},
	});
});

// обработчик событий нажатий на клавиатуру
bot.on("callback_query", (query) => {
	const chatId = query.message.chat.id;

	let img = "";

	if (query.data === "moreKeks") {
		// если кот
		img = "keks.png";
	}

	if (query.data === "morePes") {
		// если пёс
		img = "pes.png";
	}

	if (img) {
		bot.sendPhoto(chatId, img, {
			// прикрутим клаву
			reply_markup: {
				inline_keyboard: keyboard,
			},
		});
	} else {
		bot.sendMessage(chatId, "Непонятно, давай попробуем ещё раз?", {
			// прикрутим клаву
			reply_markup: {
				inline_keyboard: keyboard,
			},
		});
	}
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
	// 'msg' is the received Message from Telegram
	// 'match' is the result of executing the regexp above on the text content
	// of the message

	const chatId = msg.chat.id;
	const resp = match[1]; // the captured "whatever"

	// send back the matched "whatever" to the chat
	bot.sendMessage(chatId, resp);
});
