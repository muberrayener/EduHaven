import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLeaderboard } from "@/queries/timerQueries";
import { useUserStore } from "@/stores/userStore";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const LeaderboardItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 transition-all">
      <div className="flex gap-4 items-center justify-between w-full">
        <div className="w-8 h-6 rounded-full bg-ter animate-pulse" />

        <div className="flex  items-center flex-1 gap-2">
          <div className="w-8 h-8 rounded-full bg-ter animate-pulse" />
          <div className="w-1/2 h-4 rounded-xl bg-ter animate-pulse" />
        </div>

        <div className="w-8 h-4 rounded-xl bg-ter animate-pulse" />
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const { userId } = useParams();
  const { user } = useUserStore();
  const location = useLocation();
  const [view, setView] = useState("weekly");
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [imageErrorIds, setImageErrorIds] = useState(new Set());

  // Replace direct axios call with TanStack Query hook
  const { data: leaderboard = [], isLoading } = useLeaderboard(
    view,
    friendsOnly
  );
  useEffect(() => {
    if (user?._id) {
      setCurrentUserId(user._id);
    }
  }, [user]);

  const highlightedUserId =
    location.pathname.startsWith("/user/") && userId ? userId : currentUserId;

  const handleDropdownClick = (viewType) => setView(viewType);
  const handleFriendsOnlyToggle = () => setFriendsOnly((prev) => !prev);

  const currentUser = leaderboard.find((user) => user.userId === currentUserId);
  const highlightedUser = leaderboard.find(
    (user) => user.userId === highlightedUserId
  );

  const getBadge = (rank) => {
    const baseBadgeStyle = `inline-flex items-center gap-1 rounded-full text-xs font-medium px-2 py-1 -ml-3`;

    switch (rank) {
      case 0:
        return (
          <span className={`${baseBadgeStyle} bg-[var(--btn)] text-white`}>
            🥇 <span>1</span>
          </span>
        );
      case 1:
        return (
          <span
            className={`${baseBadgeStyle} bg-[var(--bg-sec)] text-[var(--txt)]`}
          >
            🥈 <span>2</span>
          </span>
        );
      case 2:
        return (
          <span
            className={`${baseBadgeStyle} bg-[var(--bg-ter)] text-[var(--txt)]`}
          >
            🥉 <span>3</span>
          </span>
        );
      default:
        return (
          <span className="text-[var(--txt-dim)] font-medium text-sm">
            {rank + 1}.
          </span>
        );
    }
  };

  const formatDuration = (minutes) => {
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const remainingMinutes = minutes % 60;

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (remainingMinutes > 0 || result === "") result += `${remainingMinutes}m`;
    return result.trim();
  };

  return (
    <div className="p-6 w-full bg-[var(--bg-sec)] mx-auto shadow-md rounded-3xl min-w-96">
      {/* Header */}
      <div className="justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[var(--txt)]">Leaderboard</h2>

        <div className="flex items-center justify-between my-2">
          {/* Friends Only Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Friends Only</span>
            <button
              onClick={handleFriendsOnlyToggle}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                friendsOnly ? "bg-[var(--btn)]" : "bg-[var(--bg-ter)]"
              }`}
            >
              <div
                className={`w-4 h-4  rounded-full shadow-md transform transition-transform duration-300 ${
                  friendsOnly
                    ? "translate-x-4 bg-white"
                    : "translate-x-0 bg-gray-400"
                }`}
              />
            </button>
          </div>
          {/* Timeframe Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="transparent">
                {view.charAt(0).toUpperCase() + view.slice(1)}{" "}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg">
              {["daily", "weekly", "monthly"].map((period) => (
                <DropdownMenuItem
                  key={period}
                  onSelect={() => handleDropdownClick(period)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex items-center justify-between px-2 pb-2 text-sm font-semibold text-[var(--txt-dim)]">
        <div className="flex gap-6">
          <div>Rank</div>
          <div className="text-center">User</div>
        </div>
        <div className="text-right">Time</div>
      </div>

      {/* Leaderboard Content */}
      {isLoading ? (
        <div className="space-y-2 min-h-[450px]">
          <LeaderboardItemSkeleton />
          <LeaderboardItemSkeleton />
          <LeaderboardItemSkeleton />
        </div>
      ) : (
        <div className="space-y-2 transition-all duration-500 opacity-100 translate-y-0 min-h-[450px]">
          {leaderboard.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[var(--txt-dim)] text-sm font-medium">
              No records found for this timeframe.
            </div>
          ) : (
            leaderboard.slice(0, 10).map((user, index) => {
              const isCurrentUser = user.userId === currentUserId;
              return (
                <div
                  key={user.userId}
                  className={`flex items-center justify-between px-5 py-3 rounded-xl transition-all text-sm ${
                    user.userId === highlightedUserId
                      ? "bg-[var(--btn)] text-white"
                      : "hover:bg-[var(--bg-ter)] text-[var(--txt)]"
                  }`}
                >
                  <div className="flex gap-2">
                    <div className="flex justify-start min-w-9">
                      {getBadge(index)}
                    </div>
                    <Link
                      to={isCurrentUser ? "/stats" : `/user/${user.userId}`}
                      className="text-center font-semibold flex items-center gap-2"
                    >
                      {user.profilePicture &&
                      !imageErrorIds.has(user.userId) ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.username}'s avatar`}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                          onError={() => {
                            setImageErrorIds((prev) => {
                              const next = new Set(prev);
                              next.add(user.userId);
                              return next;
                            });
                          }}
                        />
                      ) : null}
                      <span className="truncate max-w-[12rem] 2xl:max-w-[9.5rem] inline-block align-middle">
                        {user.username}
                      </span>
                    </Link>
                  </div>

                  <div
                    className={`text-right font-medium ${
                      isCurrentUser ? "text-white" : "text-[var(--txt-dim)]"
                    }`}
                  >
                    {formatDuration(user.totalDuration)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      {currentUser && leaderboard.length > 0 && (
        <div className="mt-6 text-center text-lg font-semibold text-[var(--txt-dim)]">
          {highlightedUserId === currentUserId ? (
            <>
              Your Position:{" "}
              {leaderboard.findIndex((u) => u.userId === currentUserId) + 1} (
              {formatDuration(currentUser.totalDuration)})
            </>
          ) : (
            <>
              {
                leaderboard.find((user) => user.userId === highlightedUserId)
                  .username
              }
              {"'s Position: "}
              {leaderboard.findIndex((u) => u.userId === highlightedUserId) +
                1}{" "}
              ({formatDuration(highlightedUser.totalDuration)})
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
