// components/ProfileCard/ProfileCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { MessageCircle, Activity } from "lucide-react";


// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const MyRooms = ({ isCurrentUser, myRooms }) => {
  const navigate = useNavigate();
  const [joinStatus, setJoinStatus] = useState({}); // status per room

  const updateJoinStatus = (roomId, status) => {
    setJoinStatus(prev => ({ ...prev, [roomId]: status }));
  };

  const handleJoin = async (room) => {
    const status = joinStatus[room._id] || (room.isJoined ? 'member' : 'none');

    if (room.isPrivate) {
      if (status === "member") {
        try {
          await axiosInstance.post(`/session-room/${room._id}/join`);
          toast.success("Entering room...");
          navigate(`/session/${room._id}`);
        } catch (err) {
          toast.error(err.response?.data?.error || "Failed to enter room");
        }
      } else if (status === "pending") {
        toast.info("Your join request is pending approval.");
      } else {
        try {
          await axiosInstance.post(`/session-room/${room._id}/request-join`);
          updateJoinStatus(room._id, "pending");
          toast.success("Join request sent.");
        } catch (err) {
          const message = err.response?.data?.error;
          if (message?.toLowerCase().includes("already a member")) {
            updateJoinStatus(room._id, "member");
            toast.success("You are already a member. Entering room...");
            navigate(`/session/${room._id}`);
          } else {
            toast.error(message || "Failed to send request");
          }
        }
      }
    } else {
      try {
        await axiosInstance.post(`/session-room/${room._id}/join`);
        updateJoinStatus(room._id, "member");
        toast.success("Joined room.");
        navigate(`/session/${room._id}`);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to join room");
      }
    }
  };

  const handleCancelRequest = async (room) => {
    try {
      await axiosInstance.post(`/session-room/${room._id}/cancel-request`);
      updateJoinStatus(room._id, "none");
      toast.success("Join request canceled.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel request");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/50 to-purple-500/5 rounded-3xl shadow-2xl p-6 w-full h-fit relative overflow-hidden backdrop-blur-sm border border-white/10">
      <div className="inner">
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow-lg mb-6 tracking-wider">
          {isCurrentUser ? 'My Rooms' : "User's Rooms"}
        </h2>

        {myRooms.length === 0 ? (
          <p className="text-center text-gray-300 italic p-4 border border-white/10 rounded-lg bg-white/5">
            You haven't created any rooms yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {myRooms.map((room) => {
              const status = joinStatus[room._id] || (room.isJoined ? 'member' : 'none');
              const categoryText = truncateText(room.cateogery, 25);

              return (
                <li
                  key={room._id}
                  className={`flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 shadow-md transition-all duration-300 ${
                    status === 'member' ? 'opacity-75 cursor-default' : 'hover:scale-[1.02] hover:bg-white/20 hover:shadow-xl'
                  }`}
                >
                  {/* Room Details */}
                  <div className="flex flex-col text-white min-w-0 pr-4 flex-grow cursor-pointer">
                    <span className="font-semibold text-black text-xl truncate mb-1" title={room.name}>
                      {room.name}
                    </span>
                    <span className="text-sm text-black-400 italic" title={room.cateogery}>
                      Category: {categoryText}
                    </span>
                  </div>

                  {/* Join / Request Button */}
                  {room.isPrivate ? (
                    status === "member" ? (
                      <Button onClick={() => handleJoin(room)} className="w-full flex items-center justify-center gap-2">
                        
                        Enter Room
                      </Button>
                    ) : status === "pending" ? (
                      <Button onClick={() => handleCancelRequest(room)} className="w-full flex items-center justify-center gap-2">
                        Cancel Request
                      </Button>
                    ) : (
                      <Button onClick={() => handleJoin(room)} className="w-full flex items-center justify-center gap-2">
                        Request Join
                      </Button>
                    )
                  ) : status !== "member" ? (
                    <Button onClick={() => handleJoin(room)} className="w-full flex items-center justify-center gap-2">
                      
                      Join
                    </Button>
                  ) : (
                    <Button disabled className="w-full flex items-center justify-center gap-2 bg-gray-400/30 cursor-not-allowed">
                      Already Joined
                    </Button>
                  )}
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
