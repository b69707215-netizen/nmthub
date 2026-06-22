import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Telegram users who pressed /start on the bot — заявки рассылаются всем им
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: text("chat_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Заявки с сайта (запись на урок / бесплатное занятие)
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  subject: text("subject"),
  message: text("message"),
  type: text("type").notNull(), // 'free' | 'lesson'
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
