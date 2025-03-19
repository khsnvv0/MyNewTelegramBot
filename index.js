const { Telegraf, Markup } = require("telegraf");

// Tokenni .env faylidan olish
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);

let lastMessageId = {};

// Xabarni o‘chirish funksiyasi
async function deleteLastMessage(ctx) {
  try {
    if (lastMessageId[ctx.chat.id]) {
      await ctx.deleteMessage(lastMessageId[ctx.chat.id]);
    }
  } catch (error) {
    console.error("Xabar o‘chirilmadi:", error.message);
  }
}

// Asosiy menu
async function sendMainMenu(ctx) {
  try {
    await deleteLastMessage(ctx);
    const msg = await ctx.reply(
      "Assalomu alaykum 🤝 Menulardan birini tanlang ✅",
      Markup.inlineKeyboard([
        [Markup.button.callback("📌 Xizmatlar", "services")],
        [Markup.button.callback("🗣️ Admin bilan bog‘lanish", "contact_admin")],
      ])
    );
    lastMessageId[ctx.chat.id] = msg.message_id;
  } catch (error) {
    console.error("Asosiy menu yuborishda xato:", error.message);
  }
}

// Botni boshlash
bot.start(async (ctx) => {
  await sendMainMenu(ctx);
});

// Admin bilan bog‘lanish
bot.action("contact_admin", async (ctx) => {
  try {
    await deleteLastMessage(ctx);
    const msg = await ctx.reply(
      "👨‍💻 Admin lichkasi 👉 @khasanv",
      Markup.inlineKeyboard([
        [Markup.button.callback("🔙 Asosiy menu", "main_menu")],
      ])
    );
    lastMessageId[ctx.chat.id] = msg.message_id;
    await ctx.answerCbQuery();
  } catch (error) {
    console.error("Admin bilan bog‘lanishda xato:", error.message);
  }
});

// Xizmatlar bo‘limi
bot.action("services", async (ctx) => {
  try {
    await deleteLastMessage(ctx);
    const msg = await ctx.reply(
      "Xizmatlardan birini tanlang 👇🏻",
      Markup.inlineKeyboard([
        [Markup.button.callback("🔥 Telegram Premium", "premium")],
        [Markup.button.callback("⭐🔥 Telegram Yulduz Savdo", "stars")],
        [Markup.button.callback("👤 Telegram akkauntlar", "telegram_accounts")],
        [Markup.button.callback("🔙 Asosiy menu", "main_menu")],
      ])
    );
    lastMessageId[ctx.chat.id] = msg.message_id;
    await ctx.answerCbQuery();
  } catch (error) {
    console.error("Xizmatlar bo‘limida xato:", error.message);
  }
});

// Har bir xizmat bo‘limi
const services = {
  premium: [
    ["📆 1 oylik - 46 000 UZS", "premium_1m"],
    ["📆 3 oylik - 175 000 UZS", "premium_3m"],
    ["📆 6 oylik - 230 990 UZS", "premium_6m"],
    ["📆 1 yillik - 395 990 UZS", "premium_12m"],
  ],
  stars: [
    ["100 ta stars - 31000 so‘m", "stars_100"],
    ["150 ta stars - 43000 so‘m", "stars_150"],
    ["250 ta stars - 66000 so‘m", "stars_250"],
  ],
  telegram_accounts: [
    ["🇺🇿 O‘zbek - 99 000 UZS", "uz_account"],
    ["🇷🇺 Rus - 99 000 UZS", "ru_account"],
  ],
};

// Har bir bo‘lim uchun generatsiya qilish
Object.keys(services).forEach((service) => {
  bot.action(service, async (ctx) => {
    try {
      await deleteLastMessage(ctx);
      const buttons = services[service].map(([label, value]) => [
        Markup.button.callback(label, value),
      ]);
      buttons.push([Markup.button.callback("🔙 Orqaga", "services")]);

      const msg = await ctx.reply(
        `📌 ${service.toUpperCase()} bo‘limi:\nQaysi variantni tanlaysiz? 👇🏻`,
        Markup.inlineKeyboard(buttons)
      );
      lastMessageId[ctx.chat.id] = msg.message_id;
      await ctx.answerCbQuery();
    } catch (error) {
      console.error(`${service} bo‘limida xato:`, error.message);
    }
  });
});

// Orqaga tugmalarining to‘g‘ri ishlashi
bot.action("main_menu", async (ctx) => {
  try {
    await sendMainMenu(ctx);
    await ctx.answerCbQuery();
  } catch (error) {
    console.error("Asosiy menuga qaytishda xato:", error.message);
  }
});

// To‘lov shabloni funksiyasi
async function sendPaymentTemplate(ctx, productName, price) {
  try {
    await deleteLastMessage(ctx);

    const msg = await ctx.reply(
      `✅ Sizning buyurtmangiz: ${productName}  
📅 Narxi: ${price} 
💳 Ushbu karta raqamiga pul o‘tkazing va chekini adminga yuboring @khasanv:   
\`4073 4200 4270 5602\``,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🔙 Orqaga", "services")],
        ]),
      }
    );

    lastMessageId[ctx.chat.id] = msg.message_id;
  } catch (error) {
    console.error("To‘lov shablonida xato:", error.message);
  }
}

// Har bir buyurtma uchun to‘lov tugmalari
const paymentOptions = {
  premium_1m: "46 000 UZS",
  premium_3m: "175 000 UZS",
  premium_6m: "230 990 UZS",
  premium_12m: "395 990 UZS",
  stars_100: "31000 so‘m",
  stars_150: "43000 so‘m",
  stars_250: "66000 so‘m",
  uz_account: "99 000 UZS",
  ru_account: "99 000 UZS",
};

Object.keys(paymentOptions).forEach((option) => {
  bot.action(option, async (ctx) => {
    try {
      await sendPaymentTemplate(
        ctx,
        option.replace("_", " "),
        paymentOptions[option]
      );
      await ctx.answerCbQuery();
    } catch (error) {
      console.error(`${option} buyurtmasida xato:`, error.message);
    }
  });
});

// Botni ishga tushirish
bot.launch().then(() => {
  console.log("🤖 Bot ishga tushdi...");
});

// Botni to‘g‘ri o‘chirish (graceful shutdown)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
