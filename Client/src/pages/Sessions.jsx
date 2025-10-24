import { useEffect, useState } from "react";
import OtherRoom from "../components/session/OtherRooms.jsx";
import OnlineFriends from "../components/session/friendsSection/OnlineFriends.jsx";
import YourRooms from "@/components/session/YourRooms.jsx";
import SessionRooms from "@/components/session/SessionRooms.jsx";
import NotLogedInPage from "@/components/NotLogedInPage.jsx";
import axiosInstance from "@/utils/axios";
import { useUserStore } from "@/stores/userStore.js";

function Session() {
  const [view, setView] = useState("suggested");
  const { user } = useUserStore();
  const [myRooms, setMyRooms] = useState([]);
  const [otherRooms, setOtherRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axiosInstance.get("/session-room");
        setMyRooms(data.myRooms);
        setOtherRooms(data.otherRooms);
        setJoinedRooms(data.joinedRooms || []);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };

    fetchRooms();
  }, [user]);

  if (!user) return <NotLogedInPage />;

  return (
    <div className="h-[100vh] w-[calc(100vw-70px)] pb-0 flex ">
      <div className="w-[80%] overflow-x-hidden p-3 2xl:p-6 space-y-6">
        <YourRooms myRooms={myRooms} />
        <SessionRooms joinedRooms={joinedRooms} />
        <OtherRoom otherRooms={otherRooms} />
      </div>
      <aside className="w-[20%] overflow-scroll min-w-72 space-y-3 2xl:space-y-6 overflow-x-hidden p-3 2xl:p-6 border-l border-gray-500/20">
        <OnlineFriends />
      </aside>
    </div>
  );
}
export default Session;