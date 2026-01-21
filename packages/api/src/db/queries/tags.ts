import { db, inArray } from "@repo/db";
import { tags } from "@repo/db/schema/index";

export async function getOrCreateTags(tagNames: string[]) {
	const tagRecords: Array<{ id: string; name: string }> = [];

	if (tagNames.length > 0) {
		const existingTags = await db
			.select({ id: tags.id, name: tags.name })
			.from(tags)
			.where(inArray(tags.name, tagNames));

		tagRecords.push(...existingTags);

		const existingNames = new Set(existingTags.map((t) => t.name));
		const missingTags = tagNames.filter((name) => !existingNames.has(name));

		if (missingTags.length > 0) {
			const newTags = await db
				.insert(tags)
				.values(missingTags.map((name) => ({ name })))
				.returning({ id: tags.id, name: tags.name });

			tagRecords.push(...newTags);
		}
	}

	return tagRecords;
}
