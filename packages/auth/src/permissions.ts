import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements, 
    game: ["create", "update", "delete"],
    publisher: ["create", "update", "delete"],
    developer: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
    
});

export const admin = ac.newRole({
    game: ["create", "update", "delete"],
    publisher: ["create", "update", "delete"],
    developer: ["create", "update", "delete"],
    ...adminAc.statements,
});
export const maintainer = ac.newRole({
    game: ["create", "update", "delete"],
    publisher: ["create", "update", "delete"],
    developer: ["create", "update", "delete"],
});