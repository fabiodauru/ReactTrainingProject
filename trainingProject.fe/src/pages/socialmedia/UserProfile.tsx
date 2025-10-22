import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type UserParams = {
  username: string;
};

export default function UserProfile() {
  const { username } = useParams<UserParams>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="m-3"> Welcome to the Profile of {username} </h1>
    </div>
  );
}
