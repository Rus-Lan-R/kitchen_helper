const { RecipeSearchClient } = require("edamam-api");
require("dotenv").config();
const UserTG = require("../model/user.tg.model");

const client = new RecipeSearchClient({
  appId: process.env.AppId,
  appKey: process.env.AppKey,
});
const fetch = require("node-fetch");
const TelegramBot = require("node-telegram-bot-api");
// Create a bot that uses 'polling' to fetch new updates
const Promise = require("bluebird");
Promise.config({
  cancellation: true,
});
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const { COMMANDS, getHelp } = require("./constants/constants");
const LoggsTG = require("../model/loggs.tg.model");

const botListiner = async () => {
  let response = {};
  let currentRecipe;
  bot.setMyCommands(COMMANDS);

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    try {
      await LoggsTG.create(msg);
    } catch (err) {
      console.log(err);
    }

    try {
      await UserTG.findOneAndUpdate({ chatId }, { $inc: { count_requests: +1 } });
    } catch (error) {
      bot.sendMessage(chatId, `error - ${error.code}`);
    }

    let arrText = msg.text.split(" ");
    if (arrText[0] === "/id") {
      arrText.splice(0, 1);
      let text = arrText.join(" ");
      console.log(`${text} sended to id 1367168810 `); // 401035846 

      bot.sendMessage(1367168810, `${text}`);
    }
    switch (msg.text) {
      case "/start":
        bot.onText(/\/start/, async (msg) => {
          try {
            await UserTG.create({
              chatId: msg.from.id,
              is_bot: msg.from.is_bot,
              first_name: msg.from?.first_name,
              last_name: msg.from?.last_name,
              username: msg.from?.username,
              language_code: msg.from?.language_code,
            });

            bot.sendMessage(chatId, "ok");
          } catch (error) {
            console.log(error);
            bot.sendMessage(chatId, `error - ${error.code}`);
          }
        });
        break;
      case "/help":
        bot.onText(/\/help/, (msg) => getHelp(msg.chat.id, bot));
        break;

      case "/healthlabel":
        bot.onText(/\/healthlabel (.+)/, async (msg, match) => {
          try {
            const chatId = msg.chat.id;
            const resp = match[1]; // the captured "whatever"

            response = await client.search({ healthlabel: `${resp}` });
            // send back the matched "whatever" to the chat

            bot.sendMessage(chatId, `Find ${response.hits.length} ${msg.text} recepi`, makeButtonForChoseRecipe(response.hits));
          } catch (error) {
            bot.sendMessage(chatId, `Not Found ${match[1]}`);
          }
        });
        break;

      case "/help":
        bot.onText(/\/help/, (msg) => getHelp(msg.chat.id, bot));
        break;

      case msg.text:
        try {
          response = await client.search({ query: `${msg.text}` });
          bot.sendMessage(chatId, `Find ${response.hits.length} ${msg.text} recepi`, makeButtonForChoseRecipe(response.hits));
        } catch (error) {
          bot.sendMessage(chatId, `Not Found ${msg.text}`);
        }
        break;

      default:
        break;
    }
  });

  bot.on("callback_query", (query) => {
    // console.log("query === >>> ", response.hits[query.data].recipe);
    const chatId = query.message.chat.id;
    if (query.data === "details") {
      response.hits[currentRecipe].recipe.ingredients.forEach((el) => bot.sendMessage(chatId, makeFullRecipe(el)));

      removeHisKeyboard(query);
    } else {
      currentRecipe = query.data;
      bot.sendMessage(chatId, makeRecipeMessage(response.hits[currentRecipe].recipe), {
        reply_markup: {
          resize_keyboard: true,
          inline_keyboard: [[{ text: "more details", callback_data: "details" }]],
        },
      });
    }
  });
};

// --------------------------------------------------------------------------
const removeHisKeyboard = (callbackQuery) => {
  const messageText = callbackQuery.message.text;
  const messageId = callbackQuery.message.message_id;
  return bot.editMessageText(messageText, {
    message_id: messageId,
    chat_id: callbackQuery.from.id,
    reply_markup: {
      inline_keyboard: [],
    },
  });
};
// -------------------------------
const makeFullRecipe = (ingred) => {
  return `
  ${ingred.text}\nWeight ${Math.floor(ingred.weight)}g.\n\n${ingred.image}
  
  `;
};
// ---------------------------
const makeButtonForChoseRecipe = (arrRecipe) => {
  let arr = arrRecipe.map((el, index) => [{ text: `${el.recipe.label}`, callback_data: `${index}` }]);
  let obj = {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [],
    },
  };
  obj.reply_markup.inline_keyboard = arr;
  return obj;
};

const makeRecipeMessage = (recipe) => {
  let ingredients = recipe.ingredientLines.reduce((acc, el, index) => acc + `${index + 1}) ` + el + "\n", "");
  return `
  ${recipe.label}\nCallories - ${Math.floor(recipe.calories)}\nCooking time - ${recipe.totalTime}min.\n\n${ingredients}
	\n${recipe.image}
  `;
};

module.exports = { botListiner };
