import { ORPCError, os } from "@orpc/server";
import type { Context } from "../context";
import { auth, type PermissionCheck } from "@repo/auth";
export const requirePermission = (permissions: PermissionCheck) => {
	return os.$context<Context>().middleware(async ({ context, next }) => {
		if (!context.session) {
			throw new Error(
				"requirePermission middleware must be used after authMiddleware. " +
					"Ensure your procedure chain includes authMiddleware before requirePermission.",
			);
		}

        const result = await auth.api.userHasPermission({
		body: {
			userId: context.session.user.id,
			permissions,
		},
	});

		const hasPermission =
			typeof result === "boolean" ? result : result?.success === true;

		if (!hasPermission) {
			throw new ORPCError("FORBIDDEN", {
            message: `Du hast dazu keine Rechte`,
			});
		}

		return next();
	});
};