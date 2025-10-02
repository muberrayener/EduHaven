import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Search, User, Link, Copy, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axios";
import { toast } from "react-toastify";

const SharePopup = ({ note, onClose, onShare }) => {
  const [step, setStep] = useState("visibility");
  const [visibility, setVisibility] = useState(note?.visibility || "private");
  const [shareLink, setShareLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [accessLevel, setAccessLevel] = useState("view");
  const [loading, setLoading] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  // Generate share link for private notes
  const generateShareLink = async () => {
    setGeneratingLink(true);
    try {
      const response = await axiosInstance.post(`/note/${note._id}/generate-share-link`);
      const { shareLink } = response.data;
      setShareLink(shareLink);
      toast.success("Share link generated!");
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error(error.response?.data?.error || "Failed to generate share link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/user/find-user?search=${encodeURIComponent(query)}`);
      const data = response.data;
      
      if (data.users) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleVisibilityContinue = async () => {
    try {
      // Update note visibility
      await axiosInstance.put(`/note/${note._id}`, {
        visibility: visibility
      });

      if (visibility === "private") {
        await generateShareLink();
      } else {
        setStep("collaborators");
      }
    } catch (error) {
      console.error("Error updating note visibility:", error);
      toast.error(error.response?.data?.error || "Failed to update note visibility");
    }
  };

  const handleShare = async () => {
    if (!selectedUser) return;

    try {
      await onShare(note._id, selectedUser._id, accessLevel);
      toast.success(`Note shared successfully with ${selectedUser.FirstName +" " + selectedUser.LastName+"("+selectedUser.Username+")"}!`);
      onClose();
    } catch (error) {
      console.error("Error sharing note:", error);
      toast.error(error.message || "Failed to share note");
    }
  };

  const handleBack = () => {
    if (step === "collaborators") {
      setStep("visibility");
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[var(--bg-primary)] rounded-lg p-6 w-96 max-w-[90vw] shadow-xl border border-[var(--bg-ter)]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--txt)]">
            {step === "visibility" ? "Share Settings" : "Add Collaborators"}
          </h3>
          <Button
            variant="transparent"
            size="icon"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--bg-ter)]"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Step 1: Visibility Selection */}
          {step === "visibility" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--txt)]">
                  Note Visibility
                </label>
                <div className="space-y-2">
                  <div 
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      visibility === "private" 
                        ? "border-[var(--btn)] bg-[var(--btn)]/10" 
                        : "border-[var(--bg-ter)] hover:border-[var(--btn)]/50"
                    }`}
                    onClick={() => setVisibility("private")}
                  >
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-[var(--btn)]" />
                      <div>
                        <div className="font-medium text-[var(--txt)]">Private</div>
                        <div className="text-xs text-[var(--txt-dim)]">
                          Share via link with view-only access
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      visibility === "public" 
                        ? "border-[var(--btn)] bg-[var(--btn)]/10" 
                        : "border-[var(--bg-ter)] hover:border-[var(--btn)]/50"
                    }`}
                    onClick={() => setVisibility("public")}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={20} className="text-[var(--btn)]" />
                      <div>
                        <div className="font-medium text-[var(--txt)]">Public</div>
                        <div className="text-xs text-[var(--txt-dim)]">
                          Discoverable by anyone, add collaborators for editing
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Link Section for Private Notes */}
              {visibility === "private" && shareLink && (
                <div className="p-3 rounded-lg bg-[var(--bg-ter)] border border-[var(--bg-secondary)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Link size={16} className="text-[var(--txt-dim)]" />
                    <span className="text-sm font-medium text-[var(--txt)]">Shareable Link</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 text-xs p-2 rounded border border-[var(--bg-secondary)] bg-[var(--bg-primary)] text-[var(--txt)]"
                    />
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Copy size={14} />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--txt-dim)] mt-2">
                    Anyone with this link can view this note
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVisibilityContinue}
                  disabled={generatingLink}
                  className="flex-1"
                >
                  {generatingLink ? "Generating..." : visibility === "private" ? "Generate Link" : "Continue"}
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Collaborators for Public Notes */}
          {step === "collaborators" && (
            <>

              {/* Search Input */}
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--txt-dim)]" 
                  size={16} 
                />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--bg-ter)] bg-[var(--bg-secondary)] text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
                />
              </div>

              {/* Search Results */}
              {loading && (
                <div className="text-center py-2 rounded text-[var(--txt-dim)] bg-[var(--bg-ter)]">
                  Searching users...
                </div>
              )}

              {!loading && users.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-[var(--bg-ter)] rounded-lg">
                  {users.map((user, index) => (
                    <div
                      key={user._id || user.id || index}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedUser?._id === user._id 
                          ? "bg-[var(--btn)]/20" 
                          : "hover:bg-[var(--bg-ter)]"
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--btn)] flex items-center justify-center">
                          <User size={16} className="text-[var(--btn-txt)]" />
                        </div>
                        <div>
                          <div className="text-[var(--txt)]">
                            {user.FirstName + " " + user.LastName || user.Username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-[var(--txt-dim)]">
                            {user.Email}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && searchTerm && users.length === 0 && (
                <div className="text-center py-2 rounded text-[var(--txt-dim)] bg-[var(--bg-ter)]">
                  No users found for "{searchTerm}"
                </div>
              )}

              {/* Access Level Dropdown */}
              {selectedUser && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--txt)]">
                    Access Level
                  </label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--bg-ter)] bg-[var(--bg-secondary)] text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
                  >
                    <option value="view">Can view</option>
                    <option value="edit">Can edit</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleBack}
                  variant="secondary"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={!selectedUser}
                  className="flex-1"
                >
                  Add Collaborator
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SharePopup;