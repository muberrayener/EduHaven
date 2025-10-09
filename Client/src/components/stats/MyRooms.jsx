// components/ProfileCard/ProfileCard.jsx
import axiosInstance from "@/utils/axios";
import { jwtDecode } from "jwt-decode";
import { MessageCircle, ThumbsUp, UserPlus, Activity } from "lucide-react"; // Added DoorOpen
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};


const MyRooms = ({ isCurrentUser, myRooms }) => {
  // ... keep all your state & logic here
  const navigate = useNavigate();

  const handleJoin = async (room) => {
    // Prevent joining if already joined
    if (room.isJoined) return;

    try {
      // Logic to join the room
      const res = await axiosInstance.post(`/session-room/${room._id}/join`); 
      toast.success(`Joined room: ${room.name}`);
      navigate(`/session/${room._id}`);
    } catch (err) {
      toast.error("Failed to join room");
      console.error(err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/50 to-purple-500/5 rounded-3xl shadow-2xl p-6 w-full h-fit relative overflow-hidden backdrop-blur-sm border border-white/10">
      <div className="inner">
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow-lg mb-6 tracking-wider">
          {isCurrentUser ? 'My Rooms ✨' : "User's Rooms ✨"}
        </h2>

        {myRooms.length === 0 ? (
          <p className="text-center text-gray-300 italic p-4 border border-white/10 rounded-lg bg-white/5">
            You haven't created any rooms yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {myRooms.map((room) => {
              const isJoined = room.isJoined; 
              const categoryText = truncateText(room.cateogery, 25);
              const buttonText = isJoined ? 'Joined' : 'Join Session';

              return (
                <li
                  key={room._id}
                  className={`flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 shadow-md transition-all duration-300 ${
                    isJoined
                      ? 'opacity-75 cursor-default'
                      : 'hover:scale-[1.02] hover:bg-white/20 hover:shadow-xl'
                  }`}
                >
                  {/* Room Details Container */}
                  <div 
                    className="flex flex-col text-white min-w-0 pr-4 flex-grow cursor-pointer"
                  >
                    <span className="font-semibold text-black text-xl truncate mb-1" title={room.name}>
                      {room.name}
                    </span>
                    <span className="text-sm text-black-400 italic" title={room.cateogery}>
                      Category: {categoryText}
                    </span>
                  </div>

                  {/* Join Button (Disabled/Gray if already joined) */}
                  <Button
                    onClick={() => handleJoin(room)}
                    disabled={isJoined}
                    className={`
                      ml-4 px-4 py-2 flex items-center space-x-2 rounded-full font-bold transition-colors duration-300 text-sm shadow-lg
                      ${
                        isJoined
                          ? 'bg-gray-500/80 cursor-not-allowed text-gray-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:translate-y-[-1px]'
                      }
                    `}
                  >
                    <Activity className="w-5 h-5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyRooms;