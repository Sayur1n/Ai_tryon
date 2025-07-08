import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	customerId: text('customer_id'),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	impersonatedBy: text('impersonated_by')
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const payment = pgTable("payment", {
	id: text("id").primaryKey(),
	priceId: text('price_id').notNull(),
	type: text('type').notNull(),
	interval: text('interval'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	customerId: text('customer_id').notNull(),
	subscriptionId: text('subscription_id'),
	status: text('status').notNull(),
	periodStart: timestamp('period_start'),
	periodEnd: timestamp('period_end'),
	cancelAtPeriodEnd: boolean('cancel_at_period_end'),
	trialStart: timestamp('trial_start'),
	trialEnd: timestamp('trial_end'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const customModel = pgTable("custom_model", {
	id: text("id").primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // 允许为null，默认模特不绑定用户
	name: text('name').notNull(),
	style: text('style').notNull(),
	height: text('height').notNull(),
	weight: text('weight').notNull(),
	body: text('body').notNull(),
	image: text('image').notNull(),
	gender: text('gender').notNull(), // 'male' | 'female'
	selected: text('selected').default('false'),
	isCustom: text('is_custom').default('true'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const outfitResult = pgTable("outfit_result", {
  id: text("id").primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  personImageUrl: text('person_image_url').notNull(),
  topGarmentUrl: text('top_garment_url'),
  bottomGarmentUrl: text('bottom_garment_url'),
  resultImageUrl: text('result_image_url'),
  taskId: text('task_id').notNull(),
  status: text('status').notNull(), // PENDING, RUNNING, SUCCEEDED, FAILED
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const outfitRoom = pgTable("outfit_room", {
  id: text("id").primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // 允许为null，系统默认数据
  modelImageUrl: text('model_image_url'), // 模特图URL，可选
  topImageUrl: text('top_image_url'), // 上衣图URL，可选
  bottomImageUrl: text('bottom_image_url'), // 下衣图URL，可选
  modelImageLink: text('model_image_link'), // 模特图链接，可选
  topImageLink: text('top_image_link'), // 上衣图链接，可选
  bottomImageLink: text('bottom_image_link'), // 下衣图链接，可选
  description: text('description'), // 描述文本，可选
  sex: text('sex').notNull(), // 'male' | 'female'
  type: text('type').notNull(), // 类型标识
  isDefault: text('is_default').default('false'), // 是否为系统默认数据
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
