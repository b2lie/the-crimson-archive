"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Edit, Save, X, Upload} from "lucide-react" // Added Edit, Save, X icons

// Define the expected structure of the user object passed from Dashboard.tsx
interface DashboardUser {
  username: string;
  email: string;
  userid: string; // The UUID required for fetching the full profile
}

// Define the structure of the *full* profile fetched from the API
interface UserProfile {
  userid: string;
  username: string;
  email: string;
  pfpurl: string;
  isdev: boolean;
  accountcreationdate: string;
}

interface AccountDetailsProps {
  user: DashboardUser; // Basic user info passed from parent (Dashboard)
  onBack: () => void; // Function to navigate back to "home"
}

export function AccountDetails({ user, onBack }: AccountDetailsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    isdev: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- PFP Upload State/Refs ---
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to fetch the profile details
  const fetchAccountDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/account");

      const responseBody = await response.json().catch(() => ({
        error: "An unexpected server error occurred (Non-JSON response)."
      }));

      if (!response.ok) {
        throw new Error(responseBody.error || `Failed to fetch profile: Status ${response.status}`);
      }

      const data: UserProfile = responseBody;
      setProfile(data);
      // Initialize form state when profile loads
      setEditForm({
        username: data.username,
        email: data.email,
        isdev: data.isdev,
      });

    } catch (err: any) {
      console.error("Fetch profile error:", err);
      setError(err.message || "Could not load account details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);


  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // --- PFP Upload Handlers ---

  // Function to trigger file input click
  const handlePfpClick = () => {
    // Allow clicking only if in edit mode and no file is currently selected/uploaded
    if (!isEditing || fileToUpload) return;
    fileInputRef.current?.click();
  };

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Invalid file type. Please select an image.' });
        return;
      }

      setFileToUpload(file);
      // Create a local URL for instant preview
      setImagePreview(URL.createObjectURL(file));
      setMessage(null); // Clear messages on new selection
      // Reset file input value to allow selecting the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Function to cancel the file selection/upload
  const handleCancelPfp = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview); // Clean up the preview URL
    setFileToUpload(null);
    setImagePreview(null);
    setMessage(null);
  };

  // Function to handle image upload
  const handlePfpUpload = async () => {
    if (!profile || !fileToUpload) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      // POST to the new dedicated API route
      const response = await fetch("/api/account/pfp", {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type header when sending FormData
      });

      const responseBody = await response.json().catch(() => ({
        error: "Failed to parse server response."
      }));

      if (!response.ok) {
        throw new Error(responseBody.error || `Failed to upload profile picture: Status ${response.status}`);
      }

      // The API returns the updated profile
      const updatedProfile: UserProfile = responseBody;
      setProfile(updatedProfile);

      // Cleanup local state
      handleCancelPfp();

      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

    } catch (err: any) {
      console.error("PFP upload error:", err);
      setMessage({ type: 'error', text: err.message || 'Failed to upload profile picture.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to update the profile details
  const handleUpdateProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    setMessage(null);

    const changes = {
      username: editForm.username !== profile.username ? editForm.username : undefined,
      email: editForm.email !== profile.email ? editForm.email : undefined,
      isdev: editForm.isdev !== profile.isdev ? editForm.isdev : undefined,
    };

    // If no changes were made, just exit edit mode
    if (Object.values(changes).every(val => val === undefined)) {
      setIsEditing(false);
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/account", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      const responseBody = await response.json().catch(() => ({
        error: "Failed to parse server response."
      }));

      if (!response.ok) {
        throw new Error(responseBody.error || `Failed to update profile: Status ${response.status}`);
      }

      // Update local profile state with the new data returned from the server
      const updatedProfile: UserProfile = responseBody;
      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

    } catch (err: any) {
      console.error("Update profile error:", err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to request a password reset email
  const handlePasswordReset = async () => {
    setMessage(null);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile?.email }),
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseBody.error || 'Failed to initiate password reset.');
      }

      setMessage({ type: 'success', text: 'Password reset link sent to your email!' });

    } catch (err: any) {
      console.error("Password reset error:", err);
      setMessage({ type: 'error', text: err.message || 'Could not send reset email.' });
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={onBack} className="mt-4" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return <div className="text-center p-8">No profile data available.</div>;
  }

  // Format the date for display
  const joinedDate = new Date(profile.accountcreationdate).toLocaleDateString();

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-3xl font-bold text-primary">Account Details</CardTitle>
          <CardDescription>
            Manage and view your Crimson DB profile information.
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600 space-x-1"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="space-x-1 text-red-500 border-red-500"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="space-x-1">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          )}
          <Button onClick={onBack} variant="outline" size="sm" className="space-x-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Status Message Display */}
        {message && (
          <div className={`p-3 rounded-lg border ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="flex items-center space-x-4">
          <div className="relative group">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />

            {/* Profile Image (Clickable when editing) */}
            <img
              src={imagePreview || profile.pfpurl || '/default-pfp.jpg'}
              alt="Profile Picture"
              className={`w-20 h-20 rounded-full object-cover border-4 border-accent transition-opacity duration-200 ${isEditing && !fileToUpload ? 'cursor-pointer group-hover:opacity-75' : ''
                }`}
              onClick={handlePfpClick}
            />

            {/* Click to Upload Overlay */}
            {isEditing && !fileToUpload && (
              <div
                className="absolute inset-0 w-20 h-20 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                <Upload className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-semibold">{profile.username}</h3>
            {/* PFP Upload/Cancel Buttons */}
            {fileToUpload && (
              <div className="flex space-x-2 mt-2">
                <Button
                  onClick={handlePfpUpload}
                  disabled={isSaving}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 space-x-1"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{isSaving ? 'Uploading...' : 'Upload PFP'}</span>
                </Button>
                <Button
                  onClick={handleCancelPfp}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
            {fileToUpload && (
              <p className="text-sm text-muted-foreground mt-1">Ready to upload: {fileToUpload.name}</p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">

          {/* Username Field */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={isSaving}
              />
            ) : (
              <p className="text-lg font-semibold">{profile.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={isSaving}
              />
            ) : (
              <p className="text-lg">{profile.email}</p>
            )}
          </div>

          {/* Account Role Field */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Account Role</p>
            {isEditing ? (
              <div className="flex items-center space-x-2 h-[42px]">
                <input
                  type="checkbox"
                  id="isDev"
                  name="isdev"
                  checked={editForm.isdev}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSaving}
                />
                <label htmlFor="isDev" className="text-md cursor-pointer">
                  I am a Developer / Contributor.
                </label>
              </div>
            ) : (
              <p className={`text-lg font-semibold ${profile.isdev ? 'text-green-500' : 'text-blue-500'}`}>
                {profile.isdev ? 'Developer / Contributor' : 'Casual Fan'}
              </p>
            )}
          </div>

          {/* Member Since (Non-Editable) */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
            <p className="text-lg">{joinedDate}</p>
          </div>

          {/* Password Reset Button (Always visible) */}
          <div className="md:col-span-2 space-y-1 pt-4">
            <p className="text-sm font-medium text-muted-foreground">Security</p>
            <Button
              onClick={handlePasswordReset}
              variant="outline"
              disabled={isSaving}
            >
              Reset Password
            </Button>
          </div>

          {/* User ID (Non-Editable) */}
          <div className="md:col-span-2 space-y-1 pt-2">
            <p className="text-sm font-medium text-muted-foreground">Database ID (UUID)</p>
            <p className="text-xs text-gray-500 truncate">{profile.userid}</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}