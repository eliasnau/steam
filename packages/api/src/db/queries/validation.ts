import { db, inArray } from "@repo/db";
import {
	categories,
	developers,
	genres,
	operatingSystems,
	publishers,
	tags,
} from "@repo/db/schema/index";

export async function validateGenres(genreIds: string[]) {
	if (genreIds.length === 0) return [];

	return await db
		.select({ id: genres.id })
		.from(genres)
		.where(inArray(genres.id, genreIds));
}

export async function validateCategories(categoryIds: string[]) {
	if (categoryIds.length === 0) return [];

	return await db
		.select({ id: categories.id })
		.from(categories)
		.where(inArray(categories.id, categoryIds));
}

export async function validateOperatingSystems(osIds: string[]) {
	if (osIds.length === 0) return [];

	return await db
		.select({ id: operatingSystems.id })
		.from(operatingSystems)
		.where(inArray(operatingSystems.id, osIds));
}

export async function validateTags(tagIds: string[]) {
	if (tagIds.length === 0) return [];

	return await db
		.select({ id: tags.id })
		.from(tags)
		.where(inArray(tags.id, tagIds));
}

export async function validateDevelopers(developerIds: string[]) {
	if (developerIds.length === 0) return [];

	return await db
		.select({ id: developers.id })
		.from(developers)
		.where(inArray(developers.id, developerIds));
}

export async function validatePublishers(publisherIds: string[]) {
	if (publisherIds.length === 0) return [];

	return await db
		.select({ id: publishers.id })
		.from(publishers)
		.where(inArray(publishers.id, publisherIds));
}
