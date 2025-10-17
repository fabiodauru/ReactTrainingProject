export default function EditUser() {
  const user = {
    username: "johndoe",
    email: "johndoe@example.com",
    profilePic: "https://via.placeholder.com/150",
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white/5 p-4 rounded-xl">
        <img src={user.profilePic} className="w-24 h-24 rounded-full mx-auto" />
        <h2 className="text-center mt-2 text-lg font-semibold">
          {user.username}
        </h2>
        <p className="text-center text-sm text-gray-400">{user.email}</p>
        <nav className="mt-6 flex flex-col gap-2">
          <button>Profile</button>
          <button>Password</button>
          <button className="text-red-400">Danger Zone</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <section className="bg-white/5 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold mb-4">Personal Info</h3>
          {/* form fields */}
        </section>

        <section className="bg-white/5 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Password</h3>
          {/* password form */}
        </section>
      </main>
    </div>
  );
}
