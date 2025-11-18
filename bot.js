require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const CurrencyService = require('./services/CurrencyService');
const MathService = require('./services/MathService');

const token = process.env.BOT_TOKEN;
const exchangeApiKey = process.env.EXCHANGE_API_KEY;

if (!token || !exchangeApiKey) {
    console.error('Missing required .env variables');
    process.exit(1);
}

// Инициализация сервисов
const bot = new TelegramBot(token, { polling: true });
const currencyService = new CurrencyService(exchangeApiKey);
const mathService = new MathService();

console.log('Bot is running...');

// Приветственное сообщение
const welcomeMessage = `Привет! Я — умный конвертер и калькулятор!

Вот что я умею:

💱 Конвертировать валюты:
100 USD to EUR
1500 RUB to USD  
50 EUR to RUB

🧮 Выполнять математические расчеты:
(15 + 7) * 2
2^8 + 15 / 3
sin(45) + cos(30)

Просто отправь мне запрос в этом формате!`;

// Функция для проверки валютного запроса
function parseCurrency(text) {
    const currencyRegex = /^(\d+(?:\.\d+)?)\s+([A-Z]{3})\s+to\s+([A-Z]{3})$/i;
    const match = text.match(currencyRegex);
    
    if (match) {
        return {
            amount: parseFloat(match[1]),
            fromCurrency: match[2].toUpperCase(),
            toCurrency: match[3].toUpperCase()
        };
    }
    return null;
}

// Обработка /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, welcomeMessage);
});

// Обработка сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Игнорируем команды, которые начинаются с /
    if (text.startsWith('/')) {
        return; 
    }

    // Проверяем на валютное выражение
    const currencyData = parseCurrency(text);
    if (currencyData) {
        try {
            const waitingMsg = await bot.sendMessage(
                chatId, 
                `Конвертирую ${currencyData.amount} ${currencyData.fromCurrency} в ${currencyData.toCurrency}...`
            );

            const result = await currencyService.convert(
                currencyData.amount, 
                currencyData.fromCurrency, 
                currencyData.toCurrency
            );
            
            await bot.deleteMessage(chatId, waitingMsg.message_id);
            
            const response = `Результат:\n\n` +
                           `${currencyData.amount} ${currencyData.fromCurrency} = ${result.amount} ${currencyData.toCurrency}\n` +
                           `Курс: 1 ${currencyData.fromCurrency} = ${result.rate} ${currencyData.toCurrency}\n` +
                           `Дата: ${result.date}`;

            bot.sendMessage(chatId, response);
            
        } catch (error) {
            bot.sendMessage(chatId, `Ошибка: ${error.message}`);
        }
        return;
    }

    // Проверяем на математическое выражение
    if (mathService.isMathExpression(text)) {
        try {
            const result = mathService.calculate(text);
            bot.sendMessage(chatId, `Результат: ${text} = ${result}`);
        } catch (error) {
            bot.sendMessage(chatId, 'Не могу вычислить это выражение');
        }
        return;
    }

    // Неизвестный запрос
    bot.sendMessage(
        chatId, 
        'Неизвестный запрос: Используйте:\n• 100 USD to EUR - Пример запроса для конвертации \n• (15+7)*2 - Пример запроса для расчетов\n• /start - справка'
    );
});

// Обработка ошибок 
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});