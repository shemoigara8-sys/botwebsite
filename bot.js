const TelegramBot = require('node-telegram-bot-api');

const token = "8704352560:AAEVi4SbL9brYht1zLAp0BTnNjaLdVL6b60";
const adminId = "6764405064";

const bot = new TelegramBot(token, { polling: true });

let users = {};

function basePrice(type) {
    switch (type.toLowerCase()) {
        case "restaurant": return 15000;
        case "portfolio": return 10000;
        case "blog": return 8000;
        case "school": return 20000;
        case "company website": return 25000;
        case "e-commerce": return 35000;
        default: return 12000;
    }
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    users[chatId] = { step: 1 };

    bot.sendMessage(
        chatId,
        "👋 Welcome to WorldStarShemz Web Services!\n\nWhat type of website do you want?",
        {
            reply_markup: {
                keyboard: [
                    ["Restaurant", "E-commerce"],
                    ["Portfolio", "School"],
                    ["Blog", "Company Website"]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        }
    );
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    if (!users[chatId] || msg.text === "/start") return;

    const user = users[chatId];

    switch (user.step) {

        case 1:
            user.websiteType = msg.text;
            user.totalPrice = basePrice(msg.text);
            user.breakdown = "Base price: KES " + user.totalPrice + "\n";
            user.step++;
            bot.sendMessage(chatId, "🏢 What is your business name?");
            break;

        case 2:
            user.businessName = msg.text;
            user.step++;
            bot.sendMessage(chatId, "📄 How many pages do you need? (Enter number only)");
            break;

        case 3:
            user.pages = parseInt(msg.text);

            if (isNaN(user.pages)) {
                bot.sendMessage(chatId, "Please enter a valid number of pages.");
                return;
            }

            if (user.pages > 5) {
                let extra = (user.pages - 5) * 2000;
                user.totalPrice += extra;
                user.breakdown += "Extra pages cost: KES " + extra + "\n";
            }

            user.step++;
            bot.sendMessage(
                chatId,
                "⚙️ Type the features you need (example: payment, booking, chatbot).\nIf none, type: none"
            );
            break;

        case 4:
            let featuresText = msg.text.toLowerCase();

            if (featuresText.includes("payment")) {
                user.totalPrice += 7000;
                user.breakdown += "Online payment: KES 7000\n";
            }

            if (featuresText.includes("booking")) {
                user.totalPrice += 5000;
                user.breakdown += "Booking system: KES 5000\n";
            }

            if (featuresText.includes("chatbot")) {
                user.totalPrice += 4000;
                user.breakdown += "Chatbot: KES 4000\n";
            }

            user.features = msg.text;
            user.step++;
            bot.sendMessage(chatId, "⏳ In how many days do you need the website ready? (Enter number)");
            break;

        case 5:
            let days = parseInt(msg.text);

            if (isNaN(days)) {
                bot.sendMessage(chatId, "Please enter a valid number of days.");
                return;
            }

            if (days < 7) {
                user.totalPrice += 5000;
                user.breakdown += "Rush fee: KES 5000\n";
            }

            user.deadline = days + " days";
            user.step++;
            bot.sendMessage(chatId, "📞 Please provide your phone number or email.");
            break;

        case 6:
            user.contact = msg.text;

            // Send to admin
            bot.sendMessage(
                adminId,
                "🔥 NEW SMART WEBSITE ORDER 🔥\n\n" +
                "Type: " + user.websiteType + "\n" +
                "Business: " + user.businessName + "\n" +
                "Pages: " + user.pages + "\n" +
                "Features: " + user.features + "\n" +
                "Deadline: " + user.deadline + "\n" +
                "Contact: " + user.contact + "\n\n" +
                "💰 TOTAL: KES " + user.totalPrice
            );

            // Send breakdown to client
            bot.sendMessage(
                chatId,
                "📊 PRICE BREAKDOWN\n\n" +
                user.breakdown +
                "------------------------\n" +
                "💰 TOTAL: KES " + user.totalPrice + "\n\n" +
                "Payment will be made AFTER completion.\n\n" +
                "📲 Send payment to: 0719369552\n\n" +
                "We will contact you shortly 🚀"
            );

            delete users[chatId];
            break;
    }
});