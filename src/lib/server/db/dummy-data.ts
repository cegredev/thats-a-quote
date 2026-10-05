import { groupsCrud, quotesCrud } from "./crud";
import * as schema from "./schema";
import { db } from "#lib/server/db.js";
import { auth } from "#lib/server/auth.js";
import { sql, is } from "drizzle-orm";
import { SQLiteTable, getTableConfig } from "drizzle-orm/sqlite-core";

const resetDbManually = async () => {
	await db.run(sql`PRAGMA foreign_keys = OFF`);

	for (const t of Object.values(schema)) {
		if (is(t, SQLiteTable)) {
			await db.run(sql.raw(`DELETE FROM "${getTableConfig(t).name}"`));
		}
	}

	await db.run(sql`PRAGMA foreign_keys = ON`);
};

export const fillWithDummyData = async () => {
	await resetDbManually();

	const result = await groupsCrud.bulkCreate([
		{ name: "Demo Group 1", id: "demo-group-1" },
		{ name: "A crazy group title", id: "demo-group-2" },
	]);

	if (!result.success)
		throw new Error(
			"Failed to fill database with dummy data: " +
				JSON.stringify(result),
		);

	for (const group of result.items)
		await quotesCrud.bulkCreate(
			quotes.map((quote) => ({ ...quote, groupId: group.id })),
		);

	await createDemoUser();
};

const createDemoUser = async () => {
	const ctx = await auth.$context;

	const user = await ctx.internalAdapter.createUser(
		{
			name: "Demo User",
			email: "demo@example.com",
			emailVerified: true,
		},
		{
			method: "admin",
		},
	);

	await ctx.internalAdapter.linkAccount({
		userId: user.id,
		providerId: "credential",
		accountId: user.id,
		password: await ctx.password.hash("demo"),
	});
};

// drizzle-seed does not yet support drizzle-orm v1
// export const fillWithDummyData_drizzle_Seed = async () => {
// 	await reset(db, schema);

// 	const result = await groupsCrud.bulkCreate([
// 		{ name: "Demo Group 1" },
// 		{ name: "A crazy group title" },
// 	]);

// 	if (!result.success)
// 		throw new Error(
// 			"Failed to fill database with dummy data: " +
// 				JSON.stringify(result),
// 		);

// 	for (const group of result.items)
// 		await seed(db, { quotes: schema.quotesTable, count: 100 }).refine(
// 			(f) => ({
// 				quotes: {
// 					columns: {
// 						groupId: group.id,
// 						text: f.loremIpsum({ sentencesCount: 1 }),
// 						quotedAt: new Date().toISOString(),
// 						person: f.weightedRandom([
// 							{
// 								weight: 0.2,
// 								value: f.default({ defaultValue: null }),
// 							},
// 							{
// 								weight: 0.8,
// 								value: f.firstName(),
// 							},
// 						]),
// 						context: f.weightedRandom([
// 							{
// 								weight: 0.6,
// 								value: f.default({ defaultValue: null }),
// 							},
// 							{
// 								weight: 0.4,
// 								value: f.loremIpsum({ sentencesCount: 2 }),
// 							},
// 						]),
// 					},
// 				},
// 			}),
// 		);

// 	await createDemoUser();
// };

// This was AI. I would like to say I'm not this unfunny, but eh.
const quotes = [
	{
		text: "I'm not lazy, I'm just in energy-saving mode.",
		quotedAt: 1736845920000,
		person: "Marcus",
		context: "Declining to get off the couch",
	},
	{
		text: "It worked on my machine, so technically it's a hardware problem.",
		quotedAt: 1738593000000,
		person: "Priya",
		context: "During a production incident",
	},
	{
		text: "I don't need a map, I have vibes.",
		quotedAt: 1732293900000,
		person: "Dana",
		context: "Forty minutes into being lost",
	},
	{
		text: "Pineapple on pizza is just fruit with ambition.",
		quotedAt: 1741461600000,
		person: "Luca",
		context: null,
	},
	{
		text: "I'll start my diet right after this cake.",
		quotedAt: 1748783100000,
		person: "Aunt Rosa",
		context: "At her own birthday party",
	},
	{
		text: "If at first you don't succeed, blame the Wi-Fi.",
		quotedAt: 1744884000000,
		person: null,
		context: "Overheard at a video call",
	},
	{
		text: "My plants are thriving. Mostly the fake ones.",
		quotedAt: 1733397300000,
		person: "Elena",
		context: null,
	},
	{
		text: "I've had a great idea, and by great I mean it involves snacks.",
		quotedAt: 1747849200000,
		person: "Tobi",
		context: "Brainstorming meeting",
	},
	{
		text: "That's not a bug, that's a surprise feature.",
		quotedAt: 1752074700000,
		person: "Priya",
		context: "Demo day",
	},
	{
		text: "I'm 90% sure the cat is judging me.",
		quotedAt: 1755033000000,
		person: "Sam",
		context: "Staring contest with Biscuit",
	},
	{
		text: "Let's circle back on that, preferably never.",
		quotedAt: 1756806600000,
		person: "Greg from Accounting",
		context: null,
	},
	{
		text: "Why walk when you can overthink?",
		quotedAt: 1730277000000,
		person: null,
		context: null,
	},
	{
		text: "I put the 'pro' in procrastinate.",
		quotedAt: 1738108740000,
		person: "Marcus",
		context: "One minute before a deadline",
	},
	{
		text: "Coffee: because adulting is hard and naps aren't allowed.",
		quotedAt: 1739951100000,
		person: "Nina",
		context: "Third cup before 9am",
	},
	{
		text: "I speak fluent sarcasm and broken Spanish.",
		quotedAt: 1742925600000,
		person: "Diego",
		context: "On a language app streak",
	},
	{
		text: "Never trust a recipe that says 'quick and easy'.",
		quotedAt: 1743885300000,
		person: "Elena",
		context: "Covered in flour",
	},
	{
		text: "The meeting could have been an email, and the email could have been silence.",
		quotedAt: 1747239600000,
		person: "Greg from Accounting",
		context: null,
	},
	{
		text: "I'm on a seafood diet. I see food and I eat it.",
		quotedAt: 1726662600000,
		person: "Uncle Ben",
		context: "Family barbecue",
	},
	{
		text: "Chaos is just organization that hasn't been explained yet.",
		quotedAt: 1750673400000,
		person: "Dana",
		context: "Describing her desk",
	},
	{
		text: "If you can read this, my autocorrect has failed again.",
		quotedAt: 1753884300000,
		person: null,
		context: "Group chat mishap",
	},
	{
		text: "My bed and I have a very committed relationship.",
		quotedAt: 1754290500000,
		person: "Sam",
		context: "Monday morning",
	},
	{
		text: "I came, I saw, I forgot why I came.",
		quotedAt: 1757943600000,
		person: "Grandpa Joe",
		context: "Standing in the kitchen",
	},
	{
		text: "Calories don't count if you eat standing up. That's just science.",
		quotedAt: 1735078500000,
		person: "Aunt Rosa",
		context: "Raiding the fridge",
	},
	{
		text: "I'm not arguing, I'm just explaining why I'm right.",
		quotedAt: 1736276400000,
		person: "Luca",
		context: null,
	},
	{
		text: "Tuesday is just Monday with better PR.",
		quotedAt: 1739262000000,
		person: "Nina",
		context: null,
	},
	{
		text: "Houston, we have a problem. It's the printer again.",
		quotedAt: 1741866600000,
		person: "Tobi",
		context: "Office printer saga, part 47",
	},
	{
		text: "I told my computer I needed a break, and now it won't stop sending me Kit-Kat ads.",
		quotedAt: 1745336100000,
		person: null,
		context: null,
	},
	{
		text: "Life is short. Eat the dessert first.",
		quotedAt: 1748635200000,
		person: "Grandma June",
		context: "Ordering at a restaurant",
	},
	{
		text: "I'd agree with you, but then we'd both be wrong.",
		quotedAt: 1750181100000,
		person: "Marcus",
		context: "Debate over the best sandwich",
	},
	{
		text: "Sleep is my favorite hobby and I'm very competitive.",
		quotedAt: 1751607000000,
		person: "Diego",
		context: null,
	},
	{
		text: "My hobbies include doing nothing and being very good at it.",
		quotedAt: 1755777600000,
		person: "Sam",
		context: null,
	},
	{
		text: "Error 404: motivation not found.",
		quotedAt: 1757322300000,
		person: "Priya",
		context: "Status update",
	},
	{
		text: "I didn't choose the snack life, the snack life chose me.",
		quotedAt: 1731361500000,
		person: "Tobi",
		context: "Midnight kitchen run",
	},
	{
		text: "Adulthood is just googling how to do things and pretending you knew.",
		quotedAt: 1737484200000,
		person: "Elena",
		context: "Assembling furniture",
	},
	{
		text: "That's what she said, and by she I mean my GPS.",
		quotedAt: 1740672600000,
		person: "Dana",
		context: "Recalculating... again",
	},
	{
		text: "I'm fluent in movie quotes and nothing else.",
		quotedAt: 1742415600000,
		person: "Luca",
		context: null,
	},
	{
		text: "My dog thinks I'm a genius because I own the treats.",
		quotedAt: 1744182900000,
		person: "Nina",
		context: "Morning walk",
	},
	{
		text: "Whoever invented Monday clearly never had a weekend.",
		quotedAt: 1746432000000,
		person: null,
		context: null,
	},
	{
		text: "I work out. Out of what? Excuses, mostly.",
		quotedAt: 1749537600000,
		person: "Uncle Ben",
		context: "Gym membership, unused",
	},
	{
		text: "Brb, reinventing the wheel but square this time.",
		quotedAt: 1752845100000,
		person: "Priya",
		context: "Refactoring day",
	},
	{
		text: "I have the attention span of a squirrel with a smartphone.",
		quotedAt: 1756482600000,
		person: "Tobi",
		context: null,
	},
	{
		text: "If procrastination were an Olympic sport, I'd put it off until the next games.",
		quotedAt: 1758364200000,
		person: "Marcus",
		context: null,
	},
	{
		text: "Today's forecast: 100% chance of me staying inside.",
		quotedAt: 1728725100000,
		person: "Sam",
		context: "Rainy Saturday",
	},
	{
		text: "I love deadlines. I love the whooshing sound they make as they go by.",
		quotedAt: 1738361400000,
		person: "Dana",
		context: null,
	},
	{
		text: "Free samples are just lunch with extra steps.",
		quotedAt: 1739623500000,
		person: "Aunt Rosa",
		context: "At the supermarket",
	},
	{
		text: "I'm not short, I'm concentrated awesome.",
		quotedAt: 1740924900000,
		person: "Diego",
		context: null,
	},
	{
		text: "Never underestimate the power of a good nap.",
		quotedAt: 1745852400000,
		person: "Grandma June",
		context: "After Sunday lunch",
	},
	{
		text: "The cloud is just someone else's computer, and they're having a bad day.",
		quotedAt: 1748345700000,
		person: "Priya",
		context: "Outage postmortem",
	},
	{
		text: "I'm on the fence about everything, and the fence is very comfortable.",
		quotedAt: 1751216700000,
		person: "Elena",
		context: "Choosing a restaurant",
	},
	{
		text: "Be the person your dog thinks you are.",
		quotedAt: 1755247800000,
		person: null,
		context: "Sticker on a fridge",
	},
	{
		text: "Plot twist: the leftovers were me all along.",
		quotedAt: 1758829200000,
		person: "Luca",
		context: "Finding the fridge empty",
	},
];
