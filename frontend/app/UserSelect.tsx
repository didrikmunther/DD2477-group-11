"use client";
import { User } from "../types";

export default function UserSelect({
  users,
  selected,
  onSelect,
}: {
  users: User[];
  selected: User;
  onSelect: (user: User) => void;
}) {
  return (
    <div>
      <label
        htmlFor="user"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        User
      </label>
      <select
        id="user"
        name="user"
        className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        value={selected.id}
        onChange={(e) => {
          const user = users.find((u) => u.id === parseInt(e.target.value));
          if (user) onSelect(user);
        }}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.label}
          </option>
        ))}
      </select>
    </div>
  );
}
