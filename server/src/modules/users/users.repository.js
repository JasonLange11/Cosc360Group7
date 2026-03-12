import users from "../../data/users.json" with { type: "json" };

export function getAllUsers() {
  return users;
}