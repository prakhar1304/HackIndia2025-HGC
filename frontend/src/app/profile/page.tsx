"use client";

import { useEffect, useState } from "react";
import { useLocalAuth } from "@/context/LocalAuthContext";
import { Button } from "@/components/ui/button";
import { getLocalProfile, patchLocalUser, deleteLocalUser } from "@/services/local/users";
import { getLikedNgrok } from "@/services/ngrok/users";


export default function ProfilePage() {
  const { userId, logout } = useLocalAuth();
  const [profile, setProfile] = useState<any>(null);
  const [likedNg, setLikedNg] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [likedLoading, setLikedLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;
    
    setProfileLoading(true);
    setLikedLoading(true);
    
    getLocalProfile(userId)
      .then((d) => {
        setProfile(d.profile);
        setProfileLoading(false);
      })
      .catch(() => {
        setProfileLoading(false);
      });
      
    const ngUser = localStorage.getItem("ngrokUserId");
    if (ngUser) {
      getLikedNgrok(ngUser)
        .then((data) => {
          setLikedNg(data);
          setLikedLoading(false);
        })
        .catch(() => {
          setLikedNg([]);
          setLikedLoading(false);
        });
    } else {
      setLikedLoading(false);
    }
  }, [userId]);

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 bg-white min-h-screen">
        <h1 className="text-2xl font-extrabold text-black">Profile</h1>
        <p className="mt-2 text-gray-600">You are not logged in. Start at Onboarding.</p>
      </main>
    );
  }

  async function addSample() {
    if (!userId) return;
    await patchLocalUser(userId, { merge: true, liked: ["m_tt0816692"], fav_genres: ["Action"] });
    const d = await getLocalProfile(userId);
    setProfile(d.profile);
  }

  async function removeAccount() {
    if (!userId) return;
    await deleteLocalUser(userId);
    logout();
  }

 
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 bg-white min-h-screen">
      {/* Header card */}
      <section className="rounded-2xl border-4 border-black bg-white p-6 shadow-[12px_12px_0_0_#000] hover:shadow-[16px_16px_0_0_#000] transition-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-black">@{userId}</h1>
            <p className="text-lg font-bold text-purple-600">Your taste, your world. 🎬</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={addSample}
              className="border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] font-bold bg-transparent"
            >
              Update Profile
            </Button>
            <Button
              variant="destructive"
              onClick={removeAccount}
              className="border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] font-bold"
            >
              Delete
            </Button>
            <Button
              onClick={logout}
              className="border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] font-bold bg-purple-500 hover:bg-purple-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border-4 border-black bg-gradient-to-br from-purple-100 to-purple-200 p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-shadow">
          <h3 className="font-black text-xl text-black">🎭 Top Genres</h3>
          {profileLoading ? (
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-lg border-2 border-gray-300 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <ul className="mt-3 text-base font-semibold text-black">
              {(profile?.fav_genres || []).slice(0, 5).map((g: string) => (
                <li key={g} className="mt-2 p-2 bg-white rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000]">
                  {g}
                </li>
              ))}
              {(!profile?.fav_genres || profile.fav_genres.length === 0) && (
                <li className="mt-2 p-2 bg-gray-100 rounded-lg border-2 border-gray-300 text-gray-500">
                  No genres yet
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="rounded-xl border-4 border-black bg-gradient-to-br from-purple-100 to-purple-200 p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-shadow">
          <h3 className="font-black text-xl text-black">⭐ Favorite Actors</h3>
          {profileLoading ? (
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-lg border-2 border-gray-300 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <ul className="mt-3 text-base font-semibold text-black">
              {(profile?.fav_actors || []).slice(0, 5).map((a: string) => (
                <li key={a} className="mt-2 p-2 bg-white rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000]">
                  {a}
                </li>
              ))}
              {(!profile?.fav_actors || profile.fav_actors.length === 0) && (
                <li className="mt-2 p-2 bg-gray-100 rounded-lg border-2 border-gray-300 text-gray-500">
                  No actors yet
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="rounded-xl border-4 border-black bg-gradient-to-br from-purple-100 to-purple-200 p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-shadow">
          <h3 className="font-black text-xl text-black">🎬 Favorite Directors</h3>
          {profileLoading ? (
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-lg border-2 border-gray-300 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <ul className="mt-3 text-base font-semibold text-black">
              {(profile?.fav_directors || []).slice(0, 5).map((d: string) => (
                <li key={d} className="mt-2 p-2 bg-white rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000]">
                  {d}
                </li>
              ))}
              {(!profile?.fav_directors || profile.fav_directors.length === 0) && (
                <li className="mt-2 p-2 bg-gray-100 rounded-lg border-2 border-gray-300 text-gray-500">
                  No directors yet
                </li>
              )}
            </ul>
          )}
        </div>
      </section>

      {/* Liked / Watched */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-shadow">
          <h3 className="font-black text-xl text-black">❤️ Liked Movies</h3>
          {likedLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg border-2 border-gray-300 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(likedNg || []).map((entry: any) => {
                const m = entry.movie || entry;
                return (
                  <div
                    key={m.imdbID}
                    className="rounded-lg border-3 border-black p-4 shadow-[6px_6px_0_0_#000] bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <div className="font-black text-black">{m.Title}</div>
                    <div className="text-sm font-semibold text-purple-700">{(m.Genre || []).join(", ")}</div>
                  </div>
                );
              })}
              {(!likedNg || likedNg.length === 0) && (
                <div className="col-span-2 p-4 bg-gray-100 rounded-lg border-2 border-gray-300 text-gray-500 text-center">
                  No liked movies yet
                </div>
              )}
            </div>
          )}
        </div>
        <div className="rounded-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-shadow">
          <h3 className="font-black text-xl text-black">👀 Watched Recently</h3>
          {profileLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg border-2 border-gray-300 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(profile?.watched_movies || []).map((m: any) => (
                <div
                  key={m.imdbID}
                  className="rounded-lg border-3 border-black p-4 shadow-[6px_6px_0_0_#000] bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="font-black text-black">{m.Title}</div>
                  <div className="text-sm font-semibold text-purple-700">{(m.Genre || []).join(", ")}</div>
                </div>
              ))}
              {(!profile?.watched_movies || profile.watched_movies.length === 0) && (
                <div className="col-span-2 p-4 bg-gray-100 rounded-lg border-2 border-gray-300 text-gray-500 text-center">
                  No watched movies yet
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <SearchAndMatchFlow />

      <SplitSection />
    </main>
  );
}

function SearchAndMatchFlow() {
  const [showModal, setShowModal] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loadingText, setLoadingText] = useState("Finding user...");

  const loadingMessages = [
    "Finding user... 🔍",
    "Calculating score... 📊",
    "Looking for watch history... 🎬",
    "Analyzing movie preferences... 🎭",
    "Almost there... ⭐",
  ];

  function startSearch() {
    if (!searchId.trim()) return;

    setLoading(true);
    setShowResults(false);

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      setLoadingText(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 2000);

    setTimeout(() => {
      clearInterval(messageInterval);
      setLoading(false);
      setShowResults(true);
    }, 8000);
  }

  function closeModal() {
    setShowModal(false);
    setLoading(false);
    setShowResults(false);
    setSearchId("");
  }

  return (
    <>
      {/* Search Trigger Button */}
      <section className="mt-8">
        <div className="text-center">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-8 py-4 rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000] hover:shadow-[16px_16px_0_0_#000] transition-all transform hover:scale-105"
          >
            Find Your Movie Twin 🎬
          </Button>
        </div>
      </section>

      {/* Search Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border-4 border-black shadow-[20px_20px_0_0_#000] p-8 max-w-md w-full">
            {!loading && !showResults && (
              <>
                <h2 className="text-3xl font-black text-center text-black mb-6">Enter User ID to Match</h2>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && startSearch()}
                  placeholder="user123"
                  className="w-full p-4 text-xl font-bold border-4 border-black rounded-xl shadow-[6px_6px_0_0_#000] focus:shadow-[8px_8px_0_0_#000] outline-none transition-shadow"
                />
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={startSearch}
                    disabled={!searchId.trim()}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black py-3 border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]"
                  >
                    Search 🔍
                  </Button>
                  <Button
                    onClick={closeModal}
                    variant="outline"
                    className="flex-1 font-black py-3 border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {loading && (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-purple-100 rounded-full border-4 border-black flex items-center justify-center">
                  <div className="text-4xl animate-spin">🎬</div>
                </div>
                <p className="text-xl font-bold text-black">{loadingText}</p>
              </div>
            )}

            {showResults && (
              <div className="text-center">
                <h3 className="text-2xl font-black text-purple-600 mb-4">Perfect Movie Buddy! 🎉</h3>

                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl border-4 border-black p-6 shadow-[8px_8px_0_0_#000] mb-6">
                  <div className="text-6xl font-black text-black mb-2">87%</div>
                  <div className="text-lg font-bold text-purple-700">Match Score</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-xl border-2 border-black p-3 shadow-[4px_4px_0_0_#000]">
                    <div className="text-sm font-bold text-purple-600">Shared Favorites</div>
                    <div className="text-xs font-semibold text-black mt-1">Inception, The Matrix</div>
                  </div>
                  <div className="bg-white rounded-xl border-2 border-black p-3 shadow-[4px_4px_0_0_#000]">
                    <div className="text-sm font-bold text-purple-600">Next Watch</div>
                    <div className="text-xs font-semibold text-black mt-1">Interstellar</div>
                  </div>
                </div>

                <div className="text-lg font-black text-black mb-4">CineSoulmates! 🎭</div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]">
                    Plan a Watch Party 🍿
                  </Button>
                  <Button
                    onClick={closeModal}
                    variant="outline"
                    className="font-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] bg-transparent"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SplitSection() {
  const [acceptedInvites, setAcceptedInvites] = useState<string[]>([]);
  const [declinedInvites, setDeclinedInvites] = useState<string[]>([]);

  const similarUsers = [
    { id: "alex_movie", avatar: "🧑‍🎤", username: "Alex", match: 92 },
    { id: "sarah_films", avatar: "👩‍🎨", username: "Sarah", match: 89 },
    { id: "mike_cinema", avatar: "🧑‍💻", username: "Mike", match: 85 },
    { id: "emma_watch", avatar: "👩‍🚀", username: "Emma", match: 82 },
  ];

  const incomingRequests = [
    { id: "john_doe", username: "John", movie: "The Dark Knight" },
    { id: "jane_smith", username: "Jane", movie: "Pulp Fiction" },
  ];

  const updates = [
    "Alex accepted your invite! 🎉",
    "Sam declined your request 😔",
    "Emma is watching Inception now! 🍿",
  ];

  function handleAccept(requestId: string) {
    setAcceptedInvites([...acceptedInvites, requestId]);
  }

  function handleDecline(requestId: string) {
    setDeclinedInvites([...declinedInvites, requestId]);
  }

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      {/* Left Side - Similar Users */}
      <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[10px_10px_0_0_#000]">
        <h3 className="text-2xl font-black text-black mb-6">👥 Best Match Users</h3>
        <div className="space-y-4">
          {similarUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{user.avatar}</div>
                <div>
                  <div className="font-black text-black">{user.username}</div>
                  <div className="text-sm font-bold text-purple-600">{user.match}% match</div>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]"
              >
                Invite to Watch 🎥
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Notifications */}
      <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-[10px_10px_0_0_#000]">
        <h3 className="text-2xl font-black text-black mb-6">🔔 Invites & Updates</h3>

        {/* Incoming Requests */}
        <div className="mb-6">
          <h4 className="text-lg font-black text-purple-600 mb-3">Incoming Requests</h4>
          <div className="space-y-3">
            {incomingRequests.map((request) => {
              const isAccepted = acceptedInvites.includes(request.id);
              const isDeclined = declinedInvites.includes(request.id);

              return (
                <div
                  key={request.id}
                  className="p-3 bg-purple-50 rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-black">{request.username}</div>
                      <div className="text-sm text-purple-600">wants to watch {request.movie}</div>
                    </div>
                    {!isAccepted && !isDeclined && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-black shadow-[2px_2px_0_0_#000]"
                        >
                          ✅
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDecline(request.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black shadow-[2px_2px_0_0_#000]"
                        >
                          ❌
                        </Button>
                      </div>
                    )}
                    {isAccepted && <div className="text-green-600 font-bold">Accepted ✅</div>}
                    {isDeclined && <div className="text-red-600 font-bold">Declined ❌</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Updates */}
        <div>
          <h4 className="text-lg font-black text-purple-600 mb-3">Updates</h4>
          <div className="space-y-2">
            {updates.map((update, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000]">
                <div className="text-sm font-semibold text-black">{update}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

