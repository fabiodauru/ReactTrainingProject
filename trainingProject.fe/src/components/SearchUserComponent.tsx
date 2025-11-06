import { Search, X } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { useEffect, useState } from "react";
import { defaultUsers } from "../MockData/UserMock";
import type { User } from "../lib/type";

export default function SearchUserComponent({
  searchIsOpen,
  setSearchIsOpen,
}: {
  searchIsOpen: boolean;
  setSearchIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
    var searchChanges: User[] = [];
    users.forEach((user) => {
      if (
        user.username
          .toLocaleLowerCase()
          .includes(searchInput.toLocaleLowerCase())
      ) {
        searchChanges.push(user);
      }
    });
    setSearchedUsers(searchChanges);
  }, [users, searchInput]);

  useEffect(() => {
    setUsers(defaultUsers);
  });

  /* useEffect(() => {
    (async () => {
      try {
        var res = await fetch("http://localhost:5065/api/allUsers", {
          credentials: "include",
        });
        var data = await res.json();

        var recivedUsers = Array.isArray(data.result.results)
          ? (data.result.results as User[])
          : [];
        setUsers(recivedUsers);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []); */

  const handleSearch = () => {
    setSearchIsOpen(true);
  };

  if (users.length == 0) return <p>Loading</p>;

  return (
    <>
      <div className="w-full w-full max-w-4xl">
        <InputGroup>
          <InputGroupInput
            placeholder="theRealOtto"
            onFocus={handleSearch}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            value={searchInput}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <X onClick={() => setSearchInput("")} className="h-[1.1rem] pr-2" />
        </InputGroup>
        {searchIsOpen ? (
          <div className="h-[50vh] bg-[color:var(--color-secondary-accent)] rounded-b-xl">
            <ul>
              {searchedUsers.map((user) => (
                <li
                  key={user.username}
                  className="p-2f flex justify-start items-center gap-3 p-2"
                >
                  <img
                    src={user.profilePictureUrl}
                    alt="pfp"
                    className="h-[3rem] rounded-full"
                  />
                  <a href={"./socialMedia/User/" + user.username}>
                    {user.username}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}
