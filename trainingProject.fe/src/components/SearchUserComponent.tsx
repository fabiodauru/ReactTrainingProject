import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

export default function SearchUserComponent() {
  return (
    <>
      <div className="w-full w-full max-w-4xl">
        <InputGroup>
          <InputGroupInput placeholder="billGates" />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </>
  );
}
