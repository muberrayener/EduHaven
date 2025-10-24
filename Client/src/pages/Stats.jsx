import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotLogedInPage from "@/components/NotLogedInPage";
import ProfileCard from "../components/stats/ProfileCard/ProfileCard";
import MonthlyLevel from "../components/stats/MonthlyLevel";
import Badges from "../components/stats/Badges";
import StudyStats from "../components/stats/StudyStats";
import Goals from "../components/stats/Goals";
import Leaderboard from "../components/stats/Leaderboard";
import Test from "../components/stats/Test.jsx";
import AdCard from "@/components/AdCard";
import axiosInstance from "@/utils/axios";
import UserRoomsCard from "@/components/session/UserRoomsCard.jsx";
import { useUserStore, fetchUserStats } from "@/stores/userStore";

const Stats = ({ isCurrentUser = false }) => {
  const { userId } = useParams();
  const { user: currentUser } = useUserStore();
  const [userStats, setUserStats] = useState(null);
  const [myRooms, setMyRooms] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if(isCurrentUser){
          if(!currentUser)return;
          const { data } = await axiosInstance.get("/session-room");
          setMyRooms(data.myRooms);

          setUserStats({
            name: `${currentUser?.FirstName ?? ""} ${currentUser?.LastName ?? ""}`.trim(),
            bio: currentUser?.Bio ?? "",
            profilePicture: currentUser?.ProfilePicture ?? "",
            studyStats: {
              totalSessions: currentUser?.StudyStats?.totalSessions ?? 0,
              totalHours: currentUser?.StudyStats?.totalHours ?? 0,
              currentStreak: currentUser?.streaks?.current ?? 0,
              maxStreak: currentUser?.streaks?.max ?? 0,
              lastActive: currentUser?.streaks?.lastStudyDate ?? null,
            },
            monthlyLevel: currentUser?.MonthlyLevel ?? {},
            badges: currentUser?.Badges ?? [],
            goals: currentUser?.Goals ?? [],
            leaderboard: currentUser?.Leaderboard ?? [],
            testData: currentUser?.TestData ?? {},
          });
        } else {
          const res = await fetchUserStats(userId);

          const { data } = await axiosInstance.get("/session-room");

          const filteredRooms = data.otherRooms.filter(
            (room) => room.createdBy === userId
          );
          setUserRooms(filteredRooms);

          setUserStats({
            name: `${res.userInfo?.firstName ?? ""} ${res.userInfo?.lastName ?? ""}`.trim(),
            bio: res.userInfo?.bio ?? "",
            profilePicture: res.userInfo?.profilePicture ?? "",
            studyStats: {
              totalSessions: res.stats?.totalSessions ?? 0,
              totalHours: res.stats?.totalHours ?? 0,
              currentStreak: res.stats?.streaks?.current ?? 0,
              maxStreak: res.stats?.streaks?.max ?? 0,
              lastActive: res.stats?.streaks?.lastStudyDate ?? null,
            },
            monthlyLevel: res.stats?.monthlyLevel ?? {},
            badges: res.stats?.badges ?? [],
            goals: res.stats?.goals ?? [],
            leaderboard: res.stats?.leaderboard ?? [],
            testData: res.stats?.testData ?? {},
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setFetched(true);
      }
    };

    fetchStats();
  }, [isCurrentUser, userId, currentUser]);

  if (fetched && isCurrentUser && !currentUser) {
    return <NotLogedInPage />;
  }

  if (fetched && !userStats)
    return (
      <div className="m-3 2xl:m-6">
        User not found or error loading profile.
      </div>
    );

  return (
    <div className="m-3 2xl:m-6">
      <div className="flex justify-between items-center mb-3 2xl:mb-6">
        <h1 className="text-2xl font-bold">
          {isCurrentUser ? "Analytics" : userStats?.name || ""}
        </h1>
        {isCurrentUser && (
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Great! Keep it up</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 2xl:gap-6 w-full content-center">
        <div className="lg:w-[20%] min-w-72 space-y-3 2xl:space-y-6">
          <ProfileCard isCurrentUser={isCurrentUser} user={userStats} />
          {(isCurrentUser ? myRooms : userRooms)?.length > 0 && (
            <UserRoomsCard
              isCurrentUser={isCurrentUser}
              myRooms={isCurrentUser ? myRooms : userRooms}
            />
          )}

          {/*  Here we will add room created by me */}
          <div className="h-auto w-full rounded-3xl bg-[var(--bg-sec)] p-5 shadow-md space-y-4">
            <AdCard />
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3 2xl:mb-6">
            <StudyStats stats={userStats?.studyStats} />
          </div>
          <div className="flex flex-col xl:flex-col 2xl:flex-row">
            <div className="flex-1 mr-0 2xl:mr-6">
              <div className="flex gap-3 2xl:gap-6 mb-4 2xl:mb-6">
                <MonthlyLevel data={userStats?.monthlyLevel} />
                <Badges data={userStats?.badges} />
              </div>
              <div className="gap-3 2xl:gap-6 mb-3 2xl:mb-6">
                <Goals goals={userStats?.goals} isCurrentUser={isCurrentUser} />
              </div>
            </div>
            <div>
              <Leaderboard data={userStats?.leaderboard} />
            </div>
          </div>
        </div>
      </div>

      <Test data={userStats?.testData} />
    </div>
  );
};

export default Stats;
