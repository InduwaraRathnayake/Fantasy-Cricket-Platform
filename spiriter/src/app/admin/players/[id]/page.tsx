"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import swal from "sweetalert";

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id } = useParams(); // Get player ID from URL
  const [player, setPlayer] = useState<any>(null);
  const [originalPlayer, setOriginalPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch player details
  useEffect(() => {
    async function fetchPlayer() {
      try {
        const response = await fetch(`/api/admin/players/${id}`);
        const data = await response.json();
        console.log("Fetched Player:", data);
        setPlayer(data);
        setOriginalPlayer(data); // store the original copy
      } catch (error) {
        console.error("Error fetching player details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [id]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numberFields = [
      "runs",
      "ballsFaced",
      "inningsPlayed",
      "wickets",
      "oversBowled",
      "runsConceded",
    ];
    setPlayer({
      ...player,
      [name]: numberFields.includes(name) ? Number(value) : value,
    });
  };

  // Save edited player details (API call)
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(player),
      });

      if (response.ok) {
        swal("Success", "Player updated successfully!", "success");
        setIsEditing(false);
        // Update original copy with new data
        setOriginalPlayer(player);
      } else {
        swal("Error", "Failed to update player", "error");
        console.error("Failed to update player");
      }
    } catch (error) {
      console.error("Error updating player:", error);
      swal("Error", "Error updating player", "error");
    }
  };

  // Delete player (API call)
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/players/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        swal("Deleted", "Player deleted successfully!", "success").then(() => {
          router.push("/admin/players"); // Redirect back to players list
        });
      } else {
        swal("Error", "Failed to delete player", "error");
        console.error("Failed to delete player");
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      swal("Error", "Error deleting player", "error");
    }
  };

  // Helper functions for confirmations
  const handleEdit = () => {
    swal({
      title: "Enter Edit Mode",
      text: "Do you want to edit this player's details?",
      icon: "info",
      buttons: {
        deny: { text: "No", value: false },
        confirm: { text: "Yes", value: true },
      },
      dangerMode: false,
    }).then((willEdit) => {
      if (willEdit) {
        setIsEditing(true);
      }
    });
  };

  const handleSaveEdit = () => {
    swal({
      title: "Save Changes",
      text: "Are you sure you want to save these changes?",
      icon: "info",
      buttons: {
        deny: { text: "Cancel", value: false },
        confirm: { text: "Save", value: true },
      },
      dangerMode: false,
    }).then((willSave) => {
      if (willSave) {
        handleSave();
      }
    });
  };

  const handleCancelEdit = () => {
    swal({
      title: "Cancel Editing",
      text: "Are you sure you want to cancel editing? All unsaved changes will be lost.",
      icon: "warning",
      buttons: {
        deny: { text: "No", value: false },
        confirm: { text: "Yes", value: true },
      },
      dangerMode: true,
    }).then((willCancel) => {
      if (willCancel) {
        // Revert player details to original copy and disable editing
        setPlayer(originalPlayer);
        setIsEditing(false);
      }
    });
  };

  const confirmDelete = () => {
    swal({
      title: "Delete Player",
      text: "Are you sure you want to delete this player? This action cannot be undone.",
      icon: "warning",
      buttons: {
        deny: { text: "Cancel", value: false },
        confirm: { text: "Delete", value: true },
      },
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        handleDelete();
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="ml-3 text-white/80">Loading players...</p>
      </div>
    );
  }

  if (!player)
    return (
      <div className="p-6 text-center text-white">
        <p className="text-xl">Player not found.</p>
        <button
          onClick={() => router.push("/admin/players")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Players
        </button>
      </div>
    );

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-xl mx-auto bg-white/10 border border-white/20 backdrop-blur-lg shadow-md rounded-lg p-4 sm:p-6">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/player.svg"
            alt="Players Icon"
            className="w-16 h-16 sm:w-20 sm:h-20 mb-4"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center">
            {player.name}
          </h1>
          <p className="text-sm text-gray-300">{player.university}</p>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-white/80 text-sm">Name:</span>
              <input
                type="text"
                name="name"
                value={player.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 rounded outline-0 text-white mt-1 ${
                  isEditing
                    ? "bg-white/10 border-2 border-white/20"
                    : "bg-white/20"
                }`}
              />
            </label>

            <label className="block">
              <span className="text-white/80 text-sm">University:</span>
              <input
                type="text"
                name="university"
                value={player.university}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 rounded outline-0 text-white mt-1 ${
                  isEditing
                    ? "bg-white/10 border-2 border-white/20"
                    : "bg-white/20"
                }`}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-white/80 text-sm">Category:</span>
            <select
              name="category"
              value={player.category}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-2 rounded outline-0 text-white mt-1 ${
                isEditing
                  ? "bg-white/10 border-2 border-white/20"
                  : "bg-white/20"
              }`}
            >
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-Rounder</option>
            </select>
          </label>

          {/* Stats Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white border-b border-white/20 pb-2 mb-3">
              Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {[
                "runs",
                "ballsFaced",
                "inningsPlayed",
                "wickets",
                "oversBowled",
                "runsConceded",
              ].map((stat) => (
                <label key={stat} className="block">
                  <span className="text-white/80 text-sm capitalize">
                    {stat.replace(/([A-Z])/g, " $1")}:
                  </span>
                  <input
                    type="number"
                    name={stat}
                    value={player[stat]}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-2 rounded outline-0 text-white mt-1 ${
                      isEditing
                        ? "bg-white/10 border-2 border-white/20"
                        : "bg-white/20"
                    }`}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors w-full sm:w-auto"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors w-full sm:w-auto"
              >
                Edit
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors w-full sm:w-auto"
              >
                Delete
              </button>
              <button
                onClick={() => router.push("/admin/players")}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors w-full sm:w-auto"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
