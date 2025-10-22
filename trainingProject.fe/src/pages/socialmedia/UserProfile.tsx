import { useParams } from "react-router-dom";

type UserParams = {
  username: string;
};

export default function UserProfile() {
  const { username } = useParams<UserParams>();
  return (
    <div>
      <h1 className="m-3"> Welcome to the Profile of {username} </h1>
    </div>
  );
}
