import React from "react";

const Messages = () => {
  const messages = [
    { user: "John Doe", message: "Check the latest logs!" },
    { user: "Jane Smith", message: "New alert detected." },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Messages</h2>
      <div className="space-y-4">
        {messages.map(({ user, message }, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <img
              src="https://placehold.co/40x40"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-[#2D2D2D] font-semibold">{user}</p>
              <p className="text-[#7A7A7A] text-sm">{message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
