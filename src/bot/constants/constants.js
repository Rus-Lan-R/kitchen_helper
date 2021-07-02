const COMMANDS = [
	{
		command: "start",
		description: "Зарегистрироваться",
	},
	{
		command: "friday",
		description: "Показать пятничную подборку",
	},
	{
		command: "healthlabel",
		description: "Поиск по healthLabel",
	},
	{
		command: "mealtype",
		description: "Поиск по типу блюда",
	},
	{
		command: "calories",
		description: "Поиск по количеству калорий",
	},
	{
		command: "maxingredients",
		description: "максимальное количество ингридиетов",
	},
	{
		command: "help",
		description: "Показать справку",
	},
];

const getHelp = (chatId, bot) => {
	let helpText = `Телеграм-бот.\n*Доступные команды:*\n`;
	helpText += COMMANDS.map((command) => `*/${command.command}* ${command.description}`).join(`\n`);
	return bot.sendMessage(chatId, helpText, {
		parse_mode: "Markdown",
	});
};

module.exports = { COMMANDS, getHelp };
